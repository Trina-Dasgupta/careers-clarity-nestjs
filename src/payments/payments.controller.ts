import { Controller, Post, Body, UseGuards, Req, Headers } from '@nestjs/common';
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