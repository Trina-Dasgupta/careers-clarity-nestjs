import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService, private paymentsService: PaymentsService) {}

  async createOrder(userId: string, items: Array<{ trendingProjectId: string; quantity?: number }>, currency = 'usd', method = 'card') {
    // Compute total
    const projectIds = items.map((it) => it.trendingProjectId);
    const projects = await this.prisma.trendingProject.findMany({ where: { id: { in: projectIds } } });
    const projectPriceMap = new Map(projects.map((p) => [p.id, p.price || 0]));

    let total = 0;
    const orderItemsData = items.map((it) => {
      const price = projectPriceMap.get(it.trendingProjectId) || 0;
      const qty = it.quantity || 1;
      total += price * qty;
      return {
        trendingProjectId: it.trendingProjectId,
        quantity: qty,
        price,
      };
    });

    // Create order (PENDING)
    const order = await (this.prisma as any).order.create({
      data: {
        userId,
        total,
        currency,
        status: 'PENDING',
        items: {
          create: orderItemsData,
        },
      },
      include: { items: true },
    });

    // Create payment intent via PaymentsService
    try {
      const payRes = await this.paymentsService.createPaymentIntent(total, currency, { orderId: order.id });

      // Create Payment record (PENDING)
      const payment = await (this.prisma as any).payment.create({
        data: {
          orderId: order.id,
          provider: payRes.provider || (payRes.clientSecret ? 'stripe' : 'stub'),
          providerPaymentId: payRes.id || null,
          amount: total,
          currency,
          status: 'PENDING',
          method,
          metadata: payRes.metadata || {},
        },
      });

      return { order, clientSecret: payRes.clientSecret, payment };
    } catch (err) {
      // If payment intent creation failed, mark order failed
      await (this.prisma as any).order.update({ where: { id: order.id }, data: { status: 'FAILED' } });
      throw new InternalServerErrorException('Failed to create payment intent');
    }
  }

  async getOrder(id: string, userId?: string) {
    const order = await (this.prisma as any).order.findUnique({
      where: { id },
      include: { items: { include: { project: true } }, payment: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (userId && order.userId !== userId) throw new NotFoundException('Order not found for user');
    return order;
  }

  async confirmOrder(orderId: string, providerPaymentId?: string, status: 'SUCCEEDED' | 'FAILED' | 'CANCELED' = 'SUCCEEDED') {
    const order = await (this.prisma as any).order.findUnique({ where: { id: orderId }, include: { payment: true } });
    if (!order) throw new NotFoundException('Order not found');

    // Update payment record
    if (order.payment) {
      await (this.prisma as any).payment.update({ where: { id: order.payment.id }, data: { providerPaymentId: providerPaymentId || order.payment.providerPaymentId, status } });
    } else {
      await (this.prisma as any).payment.create({ data: { orderId, provider: 'manual', amount: order.total, currency: order.currency, status, method: 'manual' } });
    }

    // Update order status
    const orderStatus = status === 'SUCCEEDED' ? 'PAID' : status === 'FAILED' ? 'FAILED' : 'CANCELLED';
    await (this.prisma as any).order.update({ where: { id: orderId }, data: { status: orderStatus } });

    return { success: true, orderId, status };
  }
}
