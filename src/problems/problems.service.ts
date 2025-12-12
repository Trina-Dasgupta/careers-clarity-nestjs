import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProblemDto } from './dto/create-problem.dto';
import { getJudge0LanguageId, submitBatch, pollBatchResults } from '../libs/judge0.lib';

@Injectable()
export class ProblemsService {
  constructor(private prisma: PrismaService) {}

  async createProblem(user: any, dto: CreateProblemDto) {
    const {
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      testcases,
      codeSnippets,
      referenceSolutions,
    } = dto as any;

    // If reference solutions provided, verify against testcases
    if (referenceSolutions && typeof referenceSolutions === 'object') {
      for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
        const languageId = getJudge0LanguageId(language);

        if (!languageId) {
          throw new BadRequestException(`Language ${language} is not supported`);
        }

        const submissions = (testcases || []).map(({ input, output }) => ({
          source_code: solutionCode,
          language_id: languageId,
          stdin: input,
          expected_output: output,
        }));

        const submissionResults = await submitBatch(submissions);
        const tokens = submissionResults.map((r) => r.token);
        const results = await pollBatchResults(tokens);

        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          if (result.status.id !== 3) {
            throw new BadRequestException(`Testcase ${i + 1} failed for language ${language}`);
          }
        }
      }
    }

    const newProblem = await this.prisma.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags: tags || [],
        examples: examples || {},
        constraints,
        testcases: testcases || [],
        codeSnippets: codeSnippets || {},
        referenceSolutions: referenceSolutions || {},
        userId: user.id,
      },
    });

    return newProblem;
  }

  async getAllProblems(user: any) {
    const problems = await this.prisma.problem.findMany({
      include: {
        solvedBy: {
          where: { userId: user.id },
        },
      },
    });

    return problems;
  }

  async getProblemById(id: string) {
    const problem = await this.prisma.problem.findUnique({ where: { id } });
    if (!problem) throw new NotFoundException('Problem not found');
    return problem;
  }

  async updateProblem(user: any, id: string, dto: Partial<CreateProblemDto>) {
    const problem = await this.prisma.problem.findUnique({ where: { id } });
    if (!problem) throw new NotFoundException('Problem not found');

    // Only owner or admin can update
    if (problem.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('Not allowed to update this problem');
    }

    // For brevity we allow partial update of fields
    const updated = await this.prisma.problem.update({ where: { id }, data: dto as any });
    return updated;
  }

  async deleteProblem(user: any, id: string) {
    const problem = await this.prisma.problem.findUnique({ where: { id } });
    if (!problem) throw new NotFoundException('Problem not found');

    if (problem.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('Not allowed to delete this problem');
    }

    await this.prisma.problem.delete({ where: { id } });
    return { success: true };
  }

  async getAllProblemsSolvedByUser(user: any) {
    const problems = await this.prisma.problem.findMany({
      where: {
        solvedBy: {
          some: { userId: user.id },
        },
      },
      include: {
        solvedBy: {
          where: { userId: user.id },
        },
      },
    });

    return problems;
  }
}
