import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Difficulty } from '@prisma/client';

class TestCaseDto {
  @ApiProperty({ example: 'input' })
  @IsString()
  input: string;

  @ApiProperty({ example: 'output' })
  @IsString()
  output: string;
}

export class CreateProblemDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Two Sum' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Given an array of integers, return indices of the two numbers such that they add up to a specific target.' })
  description: string;

  @IsOptional()
  @IsEnum(['EASY', 'MEDIUM', 'HARD'] as any)
  @ApiProperty({ enum: ['EASY', 'MEDIUM', 'HARD'], required: false, example: 'EASY' })
  difficulty?: Difficulty;

  @IsOptional()
  @IsArray()
  @ApiProperty({ required: false, type: [String], example: ['array', 'hashmap'] })
  tags?: string[];

  @IsOptional()
  @ApiProperty({ required: false, example: { input: '[2,7,11,15], target = 9', output: '[0,1]' } })
  examples?: any;

  @IsOptional()
  @ApiProperty({ required: false, example: '2 <= nums.length <= 10^4' })
  constraints?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestCaseDto)
  @ApiProperty({ required: false, type: [TestCaseDto], example: [{ input: '[2,7,11,15], target = 9', output: '[0,1]' }] })
  testcases?: TestCaseDto[];

  @IsOptional()
  @ApiProperty({ required: false, example: { javascript: 'function twoSum(nums, target) { /* ... */ }' } })
  codeSnippets?: any;

  @IsOptional()
  @ApiProperty({ required: false, example: { javascript: "function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } }" } })
  referenceSolutions?: Record<string, string>;
}
