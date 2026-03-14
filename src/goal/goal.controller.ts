import {
  Controller,
  Get,
  Put,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GoalService } from './goal.service';
import { UpsertGoalDto } from './dto/upsert-goal.dto';
import { QueryGoalDto } from './dto/query-goal.dto';
import { ApiTokenGuard } from '../auth/api-token.guard';
import { CurrentApiToken } from '../auth/api-token.decorator';
import { ApiToken } from '@prisma/client';

@ApiTags('Goals')
@ApiBearerAuth()
@UseGuards(ApiTokenGuard)
@Controller('goals')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Put()
  @ApiOperation({ summary: 'Set daily goal for a domain' })
  upsert(@CurrentApiToken() token: ApiToken, @Body() dto: UpsertGoalDto) {
    return this.goalService.upsertGoal(token.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get goals with progress for a date' })
  findAll(@CurrentApiToken() token: ApiToken, @Query() query: QueryGoalDto) {
    return this.goalService.findAll(token.id, query);
  }
}
