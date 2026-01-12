import { Controller, Post, Body, UseGuards, Req, Headers, Get } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService, private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-payment-intent')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a Stripe payment intent ' })
  async createPaymentIntent(@Body() body: { amount: number; currency?: string; metadata?: any }) {
    const { amount, currency, metadata } = body;
    const result = await this.paymentsService.createPaymentIntent(amount, currency || 'usd', metadata || {});
    return { success: true, ...result };
  }

  @UseGuards(JwtAuthGuard)
  @Get('billing/summary')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user billing summary' })
  async getBillingSummary(@Req() req: any) {
    try {
      const userId = req.user?.id;

      // Get all orders for the user
      const orders = await (this.prisma as any).order.findMany({
        where: { userId },
        include: { payment: true, items: { include: { project: true } } },
        orderBy: { createdAt: 'desc' },
      });

      // Calculate billing summary
      const totalSpent = orders
        .filter(order => order.status === 'PAID')
        .reduce((sum, order) => sum + (order.total || 0), 0);

      const ordersCount = orders.length;
      const paidOrdersCount = orders.filter(order => order.status === 'PAID').length;

      // Get latest payment info
      const latestPayment = await (this.prisma as any).payment.findFirst({
        where: { order: { userId } },
        orderBy: { updatedAt: 'desc' },
      });

      const paymentStatus = latestPayment?.status || 'NONE';
      const lastPaymentDate = latestPayment?.updatedAt || null;

      // Calculate next billing date (mock - 30 days from now)
      const nextBillingDate = new Date();
      nextBillingDate.setDate(nextBillingDate.getDate() + 30);

      const records = orders.map((order: any) => {
        const status = order.status === 'PAID' ? 'paid' : order.status === 'PENDING' ? 'pending' : 'failed';
        const items = (order.items || []).map((item: any) => ({
          id: item.id,
          name: item.project?.title || 'Project',
          quantity: item.quantity,
          price: item.price,
          trendingProjectId: item.trendingProjectId,
        }));
        const primaryName = items[0]?.name || 'Project Purchase';
        const description = items.length > 1 ? `${primaryName} +${items.length - 1} more` : primaryName;

        return {
          id: order.id,
          invoiceNumber: `INV-${String(order.id).slice(-6).toUpperCase()}`,
          status,
          amount: order.total || 0,
          currency: order.currency || 'usd',
          paymentMethod: order.payment?.method || order.payment?.provider || 'card',
          createdAt: order.createdAt,
          description,
          items,
          orderStatus: order.status,
          paymentStatus: order.payment?.status || null,
        };
      });

      return {
        success: true,
        data: {
          totalSpent: parseFloat(totalSpent.toFixed(2)),
          ordersCount,
          paidOrdersCount,
          paymentStatus,
          lastPaymentDate,
          nextBillingDate,
          currency: 'usd',
          records,
        },
      };
    } catch (error) {
      console.error('Error fetching billing summary:', error);
      return {
        success: false,
        data: {
          totalSpent: 0,
          ordersCount: 0,
          paidOrdersCount: 0,
          paymentStatus: 'ERROR',
          lastPaymentDate: null,
          nextBillingDate: null,
          currency: 'usd',
          records: [],
        },
      };
    }
  }

  // Simple webhook receiver for Stripe-like events. In production, verify signature with STRIPE_WEBHOOK_SECRET.
  @Post('webhook')
  @ApiOperation({ summary: 'Receive payment provider webhook events' })
  async webhook(@Body() body: any, @Headers() headers: any, @Req() req: any) {
    try {
      const event = body;
      // Example for Stripe: payment_intent.succeeded
      if (event?.type === 'payment_intent.succeeded') {
        const pi = event.data?.object;
        const providerId = pi?.id;
        const orderId = pi?.metadata?.orderId;

        // find payment by providerPaymentId or by orderId
        let payment: any = null;
        if (providerId) {
          payment = await (this.prisma as any).payment.findFirst({ where: { providerPaymentId: providerId } });
        }
        if (!payment && orderId) {
          payment = await (this.prisma as any).payment.findFirst({ where: { orderId } });
        }

        if (payment) {
          await (this.prisma as any).payment.update({ where: { id: payment.id }, data: { status: 'SUCCEEDED', providerPaymentId: providerId || payment.providerPaymentId } });
        }
        if (orderId) {
          await (this.prisma as any).order.update({ where: { id: orderId }, data: { status: 'PAID' } });
        }
      }

      // Handle other events as needed

      return { received: true };
    } catch (err) {
      console.error('Failed webhook processing', err);
      return { received: false };
    }
  }
}
