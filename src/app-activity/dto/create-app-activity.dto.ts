import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateAppActivityDto {
  @ApiProperty({ example: 'Google Chrome' })
  @IsString()
  appName: string;

  @ApiPropertyOptional({ example: 'GitHub - Mozilla Firefox' })
  @IsOptional()
  @IsString()
  windowTitle?: string;

  @ApiProperty({ example: 30000, description: 'Duration in milliseconds' })
  @IsInt()
  @Min(0)
  duration: number;

  @ApiProperty({ example: '2026-03-13T10:00:00.000Z' })
  @IsDateString()
  startedAt: string;

  @ApiProperty({ example: '2026-03-13T10:00:30.000Z' })
  @IsDateString()
  endedAt: string;
}
