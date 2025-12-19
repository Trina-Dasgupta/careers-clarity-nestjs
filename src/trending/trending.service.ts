import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrendingDto } from './dto/create-trending.dto';

@Injectable()
export class TrendingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTrendingDto) {
    const data = {
      title: dto.title,
      description: dto.description,
      price: dto.price,
      rating: dto.rating,
      sales: dto.sales,
      author: dto.author,
      category: dto.category,
      tags: dto.tags || [],
      previewUrl: dto.previewUrl,
      liveDemo: dto.liveDemo,
      lastUpdated: dto.lastUpdated ? new Date(dto.lastUpdated) : null,
      downloads: dto.downloads,
      isTrending: dto.isTrending,
      isFeatured: dto.isFeatured,
      features: dto.features || [],
      techStack: dto.techStack || {},
      includes: dto.includes || [],
      reviews: dto.reviews,
      version: dto.version,
      link: dto.link,
      imageUrl: dto.imageUrl,
      isActive: dto.isActive,
    } as any;

    if (!data.title) throw new BadRequestException('Title is required');

    const created = await (this.prisma as any).trendingProject.create({
      data,
    });

    return created;
  }

  async findAll(activeOnly = true, page = 1, limit = 10) {
    // Validate pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page
    
    const skip = (validatedPage - 1) * validatedLimit;
    const where = activeOnly ? { isActive: true } : {};

    // Get total count
    const total = await (this.prisma as any).trendingProject.count({ where });

    // Get paginated projects
    const projects = await (this.prisma as any).trendingProject.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: validatedLimit,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / validatedLimit);
    const hasNextPage = validatedPage < totalPages;
    const hasPrevPage = validatedPage > 1;

    return {
      projects,
      pagination: {
        total,
        page: validatedPage,
        limit: validatedLimit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
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
