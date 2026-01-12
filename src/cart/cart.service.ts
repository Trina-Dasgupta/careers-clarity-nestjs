import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addToCart(userId: string, trendingProjectId: string, quantity = 1) {
    const existing = await (this.prisma as any).cartItem.findUnique({
      where: { userId_trendingProjectId: { userId, trendingProjectId } },
    });

    if (existing) {
      const updated = await (this.prisma as any).cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
      return updated;
    }

    const item = await (this.prisma as any).cartItem.create({
      data: { userId, trendingProjectId, quantity },
    });

    return item;
  }

  async getCart(userId: string) {
    return (this.prisma as any).cartItem.findMany({
      where: { userId },
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async removeFromCart(userId: string, trendingProjectId: string) {
    const existing = await (this.prisma as any).cartItem.findUnique({
      where: { userId_trendingProjectId: { userId, trendingProjectId } },
    });
    if (!existing) throw new NotFoundException('Cart item not found');
    await (this.prisma as any).cartItem.delete({ where: { id: existing.id } });
    return true;
  }

  async updateQuantity(userId: string, trendingProjectId: string, quantity: number) {
    const existing = await (this.prisma as any).cartItem.findUnique({
      where: { userId_trendingProjectId: { userId, trendingProjectId } },
    });
    if (!existing) throw new NotFoundException('Cart item not found');
    const updated = await (this.prisma as any).cartItem.update({
      where: { id: existing.id },
      data: { quantity },
    });
    return updated;
  }
}