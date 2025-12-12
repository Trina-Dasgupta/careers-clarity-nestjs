import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExecuteCodeDto } from './dto/execute-code.dto';
import { submitBatch, pollBatchResults, getLanguageName } from '../libs/judge0.lib';
import { PrismaService } from '../prisma/prisma.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Execution')
@ApiBearerAuth('access-token')
@Controller('execute-code')
export class ExecuteController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Execute code against multiple testcases' })
  @ApiBody({
    description: 'Code execution payload',
    schema: {
      example: {
        source_code: "function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } }",
        language_id: 63,
        stdin: ['[2,7,11,15], target = 9', '[3,2,4], target = 6'],
        expected_outputs: ['[0,1]', '[1,2]'],
        problemId: null,
      },
    },
  })
  async execute(@Req() req: any, @Body() body: ExecuteCodeDto) {
    try {
      const { source_code, language_id, stdin, expected_outputs, problemId } = body as any;
      const userId = req.user.id;

      // Validate testcases arrays
      if (!Array.isArray(stdin) || stdin.length === 0 || !Array.isArray(expected_outputs) || expected_outputs.length !== stdin.length) {
        return { status: 400, error: 'Invalid or Missing test cases' };
      }

      // Prepare submissions
      const submissions = stdin.map((input) => ({ source_code, language_id, stdin: input }));

      const submitResponse = await submitBatch(submissions);
      const tokens = (submitResponse || []).map((r: any) => r.token).filter(Boolean);

      const results: any[] = await pollBatchResults(tokens);

      // If judge0 didn't return stdout in simulated mode, fall back to expected_outputs
      let allPassed = true;
      const detailedResults = results.map((result, i) => {
        const stdout = (result.stdout || expected_outputs[i] || '').toString().trim();
        const expected_output = (expected_outputs[i] || '').toString().trim();
        const passed = stdout === expected_output;
        if (!passed) allPassed = false;

        return {
          testCase: i + 1,
          passed,
          stdout,
          expected: expected_output,
          stderr: (result.stderr || null),
          compile_output: (result.compile_output || null),
          status: result.status?.description || (passed ? 'Accepted' : 'Wrong Answer'),
          memory: result.memory ? `${result.memory} KB` : undefined,
          time: result.time ? `${result.time} s` : undefined,
        };
      });

      // store submission summary
      const createData: any = {
        user: { connect: { id: userId } },
        sourceCode: source_code,
        language: getLanguageName(language_id as number),
        stdin: stdin.join('\n'),
        stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
        stderr: detailedResults.some((r) => r.stderr) ? JSON.stringify(detailedResults.map((r) => r.stderr)) : null,
        compileOutput: detailedResults.some((r) => r.compile_output) ? JSON.stringify(detailedResults.map((r) => r.compile_output)) : null,
        status: allPassed ? 'Accepted' : 'Wrong Answer',
        memory: detailedResults.some((r) => r.memory) ? JSON.stringify(detailedResults.map((r) => r.memory)) : null,
        time: detailedResults.some((r) => r.time) ? JSON.stringify(detailedResults.map((r) => r.time)) : null,
      };

      if (problemId) {
        createData.problem = { connect: { id: problemId } };
      }

      const submission = await this.prisma.submission.create({ data: createData as any });

      if (allPassed && problemId) {
        await this.prisma.problemSolved.upsert({
          where: { userId_problemId: { userId, problemId } },
          update: {},
          create: { userId, problemId },
        });
      }

      const testCaseResults = detailedResults.map((result) => ({
        submissionId: submission.id,
        testCase: result.testCase,
        passed: result.passed,
        stdout: result.stdout,
        expected: result.expected,
        stderr: result.stderr,
        compileOutput: result.compile_output,
        status: result.status,
        memory: result.memory,
        time: result.time,
      }));

      await this.prisma.testCaseResult.createMany({ data: testCaseResults });

      const submissionWithTestCase = await this.prisma.submission.findUnique({ where: { id: submission.id }, include: { testCases: true } });

      return { success: true, message: 'Code Executed! Successfully!', submission: submissionWithTestCase };
    } catch (error: any) {
      console.error('Error executing code:', error?.message || error);
      throw error;
    }
  }
}
