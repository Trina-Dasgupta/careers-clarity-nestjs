import { Controller, Post, Body, UseGuards, Req, Get, Delete, Param, Patch } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Add item to cart' })
  async add(@Req() req, @Body() body: { trendingProjectId: string; quantity?: number }) {
    const userId = req.user?.id;
    const { trendingProjectId, quantity } = body;
    const item = await this.cartService.addToCart(userId, trendingProjectId, quantity || 1);
    return { success: true, message: 'Added to cart', item };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user cart items' })
  async get(@Req() req) {
    const userId = req.user?.id;
    const items = await this.cartService.getCart(userId);
    return { success: true, items };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':projectId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove item from cart' })
  async remove(@Req() req, @Param('projectId') projectId: string) {
    const userId = req.user?.id;
    await this.cartService.removeFromCart(userId, projectId);
    return { success: true, message: 'Item removed' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':projectId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update quantity for cart item' })
  async update(@Req() req, @Param('projectId') projectId: string, @Body() body: { quantity: number }) {
    const userId = req.user?.id;
    const item = await this.cartService.updateQuantity(userId, projectId, body.quantity);
    return { success: true, message: 'Quantity updated', item };
  }
}