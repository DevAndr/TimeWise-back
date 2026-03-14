import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsDateString,
  IsInt,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ example: '2026-03-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-03-14T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class TimelineQueryDto extends AnalyticsQueryDto {
  @ApiPropertyOptional({
    enum: ['day', 'hour'],
    default: 'day',
    description: 'Group interval',
  })
  @IsOptional()
  @IsIn(['day', 'hour'])
  interval?: 'day' | 'hour';
}

export class TopQueryDto extends AnalyticsQueryDto {
  @ApiPropertyOptional({
    example: 10,
    default: 10,
    description: 'Number of top entries to return',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
