import { Controller, Post, Body, UseGuards, Req, Get, Param, Put, Delete, HttpCode } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { CreateProblemDto } from './dto/create-problem.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards/admin.guard';


@ApiTags('Problems')
@ApiBearerAuth('access-token')
@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('create-problem')
  async create(@Req() req: any, @Body() body: CreateProblemDto) {
    const problem = await this.problemsService.createProblem(req.user, body);
    return { success: true, message: 'Problem Created Successfully', problem };
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-all-problems')
  async findAll(@Req() req: any) {
    const problems = await this.problemsService.getAllProblems(req.user);
    return { success: true, message: 'Problems fetched successfully', problems };
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-problem/:id')
  async findOne(@Param('id') id: string) {
    const problem = await this.problemsService.getProblemById(id);
    return { success: true, message: 'Problem fetched', problem };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put('update-problem/:id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const updated = await this.problemsService.updateProblem(req.user, id, body);
    return { success: true, message: 'Problem updated', problem: updated };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('delete-problem/:id')
  @HttpCode(200)
  async remove(@Req() req: any, @Param('id') id: string) {
    await this.problemsService.deleteProblem(req.user, id);
    return { success: true, message: 'Problem deleted Successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-solved-problems')
  async solvedByUser(@Req() req: any) {
    const problems = await this.problemsService.getAllProblemsSolvedByUser(req.user);
    return { success: true, message: 'Problems fetched successfully', problems };
  }
}