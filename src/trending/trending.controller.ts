import { Controller, Get, Post, Body, UseGuards, Req, Put, Param, Delete, Query } from '@nestjs/common';
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
  async getAll(@Query('active') active?: string) {
    const activeOnly = active === undefined || active === 'true';
    const projects = await this.trendingService.findAll(activeOnly);
    return { success: true, message: 'Trending projects fetched', projects };
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
        title: 'Awesome Project',
        description: 'Short description of the project',
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
