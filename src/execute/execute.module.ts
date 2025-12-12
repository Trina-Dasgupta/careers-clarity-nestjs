import { Module } from '@nestjs/common';
import { ExecuteController } from './execute.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExecuteController],
})
export class ExecuteModule {}
