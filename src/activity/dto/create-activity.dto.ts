import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateActivityDto {
  @ApiProperty({ example: 'github.com' })
  @IsString()
  domain: string;

  @ApiPropertyOptional({ example: 'https://github.com/user/repo' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ example: 'Repository Page' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 120, description: 'Duration in seconds' })
  @IsInt()
  @Min(0)
  duration: number;

  @ApiProperty({ example: '2026-03-13T10:00:00.000Z' })
  @IsDateString()
  startedAt: string;

  @ApiPropertyOptional({ example: '2026-03-13T10:02:00.000Z' })
  @IsOptional()
  @IsDateString()
  endedAt?: string;
}
