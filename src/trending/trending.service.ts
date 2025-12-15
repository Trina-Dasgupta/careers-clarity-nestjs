import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrendingDto } from './dto/create-trending.dto';

@Injectable()
export class TrendingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTrendingDto) {
    const { title, description, link, imageUrl, isActive } = dto as any;

    if (!title) throw new BadRequestException('Title is required');

    const created = await (this.prisma as any).trendingProject.create({
      data: { title, description, link, imageUrl, isActive },
    });

    return created;
  }

  async findAll(activeOnly = true) {
    const where = activeOnly ? { isActive: true } : {};
    const projects = await (this.prisma as any).trendingProject.findMany({ where, orderBy: { createdAt: 'desc' } });
    return projects;
  }

  async findOne(id: string) {
    const project = await (this.prisma as any).trendingProject.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Trending project not found');
    return project;
  }

  async update(id: string, dto: Partial<CreateTrendingDto>) {
    await this.findOne(id); // throws if not found
    const updated = await (this.prisma as any).trendingProject.update({ where: { id }, data: dto as any });
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await (this.prisma as any).trendingProject.delete({ where: { id } });
    return { success: true };
  }
}
