import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { QueryActivityDto } from './dto/query-activity.dto';
import { ApiTokenGuard } from '../auth/api-token.guard';
import { CurrentApiToken } from '../auth/api-token.decorator';
import { ApiToken } from '@prisma/client';

@ApiTags('Activities')
@ApiBearerAuth()
@UseGuards(ApiTokenGuard)
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @ApiOperation({ summary: 'Record a single activity' })
  create(@CurrentApiToken() token: ApiToken, @Body() dto: CreateActivityDto) {
    return this.activityService.create(token.id, dto);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Record multiple activities at once' })
  createBatch(
    @CurrentApiToken() token: ApiToken,
    @Body() dtos: CreateActivityDto[],
  ) {
    return this.activityService.createBatch(token.id, dtos);
  }

  @Get()
  @ApiOperation({ summary: 'List activities with optional filters' })
  findAll(
    @CurrentApiToken() token: ApiToken,
    @Query() query: QueryActivityDto,
  ) {
    return this.activityService.findAll(token.id, query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get total time per domain' })
  getSummary(
    @CurrentApiToken() token: ApiToken,
    @Query() query: QueryActivityDto,
  ) {
    return this.activityService.getSummaryByDomain(token.id, query);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an activity' })
  remove(@CurrentApiToken() token: ApiToken, @Param('id') id: string) {
    return this.activityService.remove(token.id, id);
  }
}
