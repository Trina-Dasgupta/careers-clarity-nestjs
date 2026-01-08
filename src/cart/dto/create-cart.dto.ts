export class CreateCartDto {
  userId?: string; // optional - derived from JWT if not provided
  trendingProjectId: string;
  quantity?: number;
}