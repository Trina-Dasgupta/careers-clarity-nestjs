import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'Jane' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: 'Doe' })
  lastName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, example: '+1234567890' })
  phone?: string;
}
