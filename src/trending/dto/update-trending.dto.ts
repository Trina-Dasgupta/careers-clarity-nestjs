import { PartialType } from '@nestjs/mapped-types';
import { CreateTrendingDto } from './create-trending.dto';

export class UpdateTrendingDto extends PartialType(CreateTrendingDto) {}
