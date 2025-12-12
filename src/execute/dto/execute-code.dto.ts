import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsOptional, IsInt, IsString as IsStringValidator } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExecuteCodeDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'function twoSum(nums, target) { /* ... */ }' })
  source_code: string;

  @ApiProperty({ example: 63 })
  @IsInt()
  language_id: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsStringValidator({ each: true })
  @ApiProperty({ example: ['[2,7,11,15], target = 9'] })
  stdin: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsStringValidator({ each: true })
  @ApiProperty({ example: ['[0,1]'] })
  expected_outputs: string[];

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'problem-uuid' })
  problemId?: string;
}
