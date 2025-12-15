import { IsString, IsOptional, IsBoolean, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTrendingDto {
  @ApiProperty({ description: 'Title of the project', example: 'Awesome Project' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Short description', example: 'A short description of the project' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'External link (repo or site)', example: 'https://github.com/owner/repo' })
  @IsOptional()
  @IsUrl()
  link?: string;

  @ApiPropertyOptional({ description: 'Cover image URL', example: 'https://cdn.example.com/image.png' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Is project active', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
