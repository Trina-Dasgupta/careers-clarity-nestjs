import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  async getAllSubmissionsForUser(userId: string) {
    return this.prisma.submission.findMany({ where: { userId } });
  }

  async getSubmissionsForProblem(userId: string, problemId: string) {
    return this.prisma.submission.findMany({ where: { userId, problemId } });
  }

  async countSubmissionsForProblem(problemId: string) {
    return this.prisma.submission.count({ where: { problemId } });
  }
}
