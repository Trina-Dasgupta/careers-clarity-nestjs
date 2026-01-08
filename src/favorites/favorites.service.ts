import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async addToFavorites(userId: string, trendingProjectId: string) {
    const existing = await (this.prisma as any).favorite.findUnique({
      where: { userId_trendingProjectId: { userId, trendingProjectId } },
    });
    if (existing) return existing;

    const fav = await (this.prisma as any).favorite.create({ data: { userId, trendingProjectId } });
    return fav;
  }

  async removeFromFavorites(userId: string, trendingProjectId: string) {
    const existing = await (this.prisma as any).favorite.findUnique({
      where: { userId_trendingProjectId: { userId, trendingProjectId } },
    });
    if (!existing) throw new NotFoundException('Favorite not found');
    await (this.prisma as any).favorite.delete({ where: { id: existing.id } });
    return true;
  }

  async listFavorites(userId: string) {
    return (this.prisma as any).favorite.findMany({ where: { userId }, include: { project: true }, orderBy: { createdAt: 'desc' } });
  }
}