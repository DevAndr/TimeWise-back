import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class QueryAppActivityDto {
  @ApiPropertyOptional({ example: 'Google Chrome' })
  @IsOptional()
  @IsString()
  appName?: string;

  @ApiPropertyOptional({ example: '2026-03-13T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-03-14T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
