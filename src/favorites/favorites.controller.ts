import { Controller, Post, Body, UseGuards, Req, Delete, Param, Get } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Add to favorites/wishlist' })
  async add(@Req() req, @Body() body: { trendingProjectId: string }) {
    const userId = req.user?.id;
    const fav = await this.favoritesService.addToFavorites(userId, body.trendingProjectId);
    return { success: true, message: 'Added to favorites', fav };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List favorites for user' })
  async list(@Req() req) {
    const userId = req.user?.id;
    const items = await this.favoritesService.listFavorites(userId);
    return { success: true, items };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':projectId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove from favorites' })
  async remove(@Req() req, @Param('projectId') projectId: string) {
    const userId = req.user?.id;
    await this.favoritesService.removeFromFavorites(userId, projectId);
    return { success: true, message: 'Removed from favorites' };
  }
}