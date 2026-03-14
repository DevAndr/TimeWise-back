import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min } from 'class-validator';

export class UpsertGoalDto {
  @ApiProperty({ example: 'github.com' })
  @IsString()
  domain: string;

  @ApiProperty({ example: 7200, description: 'Daily goal in seconds' })
  @IsInt()
  @Min(0)
  dailyGoal: number;
}
