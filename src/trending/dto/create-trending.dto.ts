import { IsString, IsOptional, IsBoolean, IsUrl, IsNumber, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTrendingDto {
  @ApiProperty({ description: 'Title of the project', example: 'Social Network Platform' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Short description', example: 'Full-featured social media platform with real-time chat' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Price in USD', example: 299 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ description: 'Average rating', example: 4.8 })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional({ description: 'Total sales', example: 1247 })
  @IsOptional()
  @IsNumber()
  sales?: number;

  @ApiPropertyOptional({ description: 'Author name', example: 'CodeMasterPro' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ description: 'Category', example: 'Social Media' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Tags', example: ['Next.js','Node.js'] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Preview URL within site', example: '/preview/social-network' })
  @IsOptional()
  @IsString()
  previewUrl?: string;

  @ApiPropertyOptional({ description: 'Live demo URL', example: 'https://demo-social-network.vercel.app' })
  @IsOptional()
  @IsUrl()
  liveDemo?: string;

  @ApiPropertyOptional({ description: 'Last updated (ISO date string)', example: '2024-01-15' })
  @IsOptional()
  @IsString()
  lastUpdated?: string;

  @ApiPropertyOptional({ description: 'Downloads', example: '2.5k' })
  @IsOptional()
  @IsString()
  downloads?: string;

  @ApiPropertyOptional({ description: 'Is trending', example: true })
  @IsOptional()
  @IsBoolean()
  isTrending?: boolean;

  @ApiPropertyOptional({ description: 'Is featured', example: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Features list', example: ['Real-time chat with Socket.io','Post sharing & commenting'] })
  @IsOptional()
  @IsArray()
  features?: string[];

  @ApiPropertyOptional({ description: 'Tech stack object', example: { frontend: ['Next.js'], backend: ['Node.js'], database: ['MongoDB'] } })
  @IsOptional()
  @IsObject()
  techStack?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Included items', example: ['Full source code','Documentation'] })
  @IsOptional()
  @IsArray()
  includes?: string[];

  @ApiPropertyOptional({ description: 'Number of reviews', example: 89 })
  @IsOptional()
  @IsNumber()
  reviews?: number;

  @ApiPropertyOptional({ description: 'Version', example: '2.1.0' })
  @IsOptional()
  @IsString()
  version?: string;

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
