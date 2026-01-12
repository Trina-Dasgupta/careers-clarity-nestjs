import { Controller, Post, Body, UseGuards, Req, Get, Param, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create an order and payment intent' })
  async create(@Req() req, @Body() body: { items: Array<{ trendingProjectId: string; quantity?: number }>; currency?: string; method?: string }) {
    const userId = req.user?.id;
    const { items, currency, method } = body;
    const res = await this.ordersService.createOrder(userId, items || [], currency || 'usd', method || 'card');
    return { success: true, ...res };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get order by id' })
  async get(@Req() req, @Param('id') id: string) {
    const userId = req.user?.id;
    const order = await this.ordersService.getOrder(id, userId);
    return { success: true, order };
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/purchased')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user purchased projects' })
  async getPurchasedProjects(@Req() req, @Query('page') page = '1', @Query('limit') limit = '10') {
    const userId = req.user?.id;
    const result = await this.ordersService.getPurchasedProjects(userId, parseInt(page), parseInt(limit));
    return { success: true, data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/confirm')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Confirm order payment (manual or after redirect)' })
  async confirm(@Param('id') id: string, @Body() body: { providerPaymentId?: string; status?: string }) {
    const status = (body.status as any) || 'SUCCEEDED';
    const res = await this.ordersService.confirmOrder(id, body.providerPaymentId, status as any);
    return res;
  }
}
