import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class QueryGoalDto {
  @ApiPropertyOptional({ example: 'github.com' })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({
    example: '2026-03-14',
    description: 'Date in YYYY-MM-DD format (defaults to today)',
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}
