import { Controller, Get, Post, Body, UseGuards, Req, Put, Param, Delete, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { TrendingService } from './trending.service';
import { CreateTrendingDto } from './dto/create-trending.dto';
import { UpdateTrendingDto } from './dto/update-trending.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('Trending')
@Controller('trending')
export class TrendingController {
  constructor(private readonly trendingService: TrendingService) {}

  @Get()
  @ApiOperation({ summary: 'Get trending projects (public)' })
  @ApiQuery({ name: 'active', required: false, description: 'Filter by active projects (true|false)', schema: { example: 'true' } })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)', schema: { example: 1 } })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)', schema: { example: 10 } })
  async getAll(
    @Query('active') active?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    const activeOnly = active === undefined || active === 'true';
    const result = await this.trendingService.findAll(activeOnly, page, limit);
    return { 
      success: true, 
      message: 'Trending projects fetched', 
      ...result 
    };
  }

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get trending statistics (public)' })
  async getStats() {
    const projects = await this.trendingService.findAllUnfiltered();
    const totalSales = projects.projects.reduce((sum, p) => sum + (Number(p.sales) || 0), 0);
    const avgRating = projects.projects.length > 0 
      ? (projects.projects.reduce((sum, p) => sum + (Number(p.rating) || 0), 0) / projects.projects.length)
      : 0;
    const activeProjects = projects.projects.filter(p => p.isActive).length;
    const totalDownloads = projects.projects.reduce((sum, p) => {
      const downloads = typeof p.downloads === 'string' 
        ? parseInt(p.downloads.replace(/[^\d]/g, '')) || 0 
        : Number(p.downloads) || 0;
      return sum + downloads;
    }, 0);

    return {
      success: true,
      data: {
        totalSales,
        avgRating: parseFloat(avgRating.toFixed(2)),
        activeProjects,
        totalDownloads,
      },
    };
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all projects (public, no active filter)' })
  async getAllNoFilter() {
    const result = await this.trendingService.findAllUnfiltered();
    return { success: true, message: 'All trending projects fetched', ...result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single trending project (public)' })
  async getOne(@Param('id') id: string) {
    const project = await this.trendingService.findOne(id);
    return { success: true, message: 'Trending project fetched', project };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a trending project (admin only)' })
  @ApiBody({
    type: CreateTrendingDto,
    schema: {
      example: {
        title: 'Social Network Platform',
        description: 'Full-featured social media platform with real-time chat, posts, friends system, and notifications',
        price: 299,
        rating: 4.8,
        sales: 1247,
        author: 'CodeMasterPro',
        category: 'Social Media',
        tags: ['Next.js', 'Node.js', 'Socket.io', 'MongoDB', 'Tailwind'],
        previewUrl: '/preview/social-network',
        liveDemo: 'https://demo-social-network.vercel.app',
        lastUpdated: '2024-01-15',
        downloads: '2.5k',
        isTrending: true,
        isFeatured: false,
        features: [
          'Real-time chat with Socket.io',
          'Post sharing & commenting',
          'Friend system & notifications',
          'Image upload with Cloudinary',
          'Responsive design'
        ],
        techStack: {
          frontend: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Redux'],
          backend: ['Node.js', 'Express', 'Socket.io', 'JWT'],
          database: ['MongoDB', 'Redis']
        },
        includes: ['Full source code', 'Documentation', 'API endpoints', 'Deployment guide'],
        reviews: 89,
        version: '2.1.0',
        link: 'https://github.com/owner/repo',
        imageUrl: 'https://cdn.example.com/image.png',
        isActive: true,
      },
    },
  })
  async create(@Body() body: CreateTrendingDto) {
    const project = await this.trendingService.create(body);
    return { success: true, message: 'Trending project created', project };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a trending project (admin only)' })
  @ApiBody({
    type: UpdateTrendingDto,
    schema: {
      example: {
        title: 'Updated Project Title',
        description: 'Updated description',
        link: 'https://github.com/owner/updated-repo',
        imageUrl: 'https://cdn.example.com/updated-image.png',
        isActive: false,
      },
    },
  })
  async update(@Param('id') id: string, @Body() body: UpdateTrendingDto) {
    const project = await this.trendingService.update(id, body);
    return { success: true, message: 'Trending project updated', project };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a trending project (admin only)' })
  async remove(@Param('id') id: string) {
    await this.trendingService.remove(id);
    return { success: true, message: 'Trending project deleted' };
  }
}