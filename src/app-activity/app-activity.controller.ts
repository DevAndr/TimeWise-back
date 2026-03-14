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
import { AppActivityService } from './app-activity.service';
import { CreateAppActivityDto } from './dto/create-app-activity.dto';
import { QueryAppActivityDto } from './dto/query-app-activity.dto';
import { ApiTokenGuard } from '../auth/api-token.guard';
import { CurrentApiToken } from '../auth/api-token.decorator';
import { ApiToken } from '@prisma/client';

@ApiTags('App Activities')
@ApiBearerAuth()
@UseGuards(ApiTokenGuard)
@Controller('app-activities')
export class AppActivityController {
  constructor(private readonly appActivityService: AppActivityService) {}

  @Post()
  @ApiOperation({ summary: 'Record a single app activity session' })
  create(
    @CurrentApiToken() token: ApiToken,
    @Body() dto: CreateAppActivityDto,
  ) {
    return this.appActivityService.create(token.id, dto);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Record multiple app activity sessions at once' })
  createBatch(
    @CurrentApiToken() token: ApiToken,
    @Body() dtos: CreateAppActivityDto[],
  ) {
    return this.appActivityService.createBatch(token.id, dtos);
  }

  @Get()
  @ApiOperation({ summary: 'List app activities with optional filters' })
  findAll(
    @CurrentApiToken() token: ApiToken,
    @Query() query: QueryAppActivityDto,
  ) {
    return this.appActivityService.findAll(token.id, query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get total time per application' })
  getSummary(
    @CurrentApiToken() token: ApiToken,
    @Query() query: QueryAppActivityDto,
  ) {
    return this.appActivityService.getSummaryByApp(token.id, query);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an app activity session' })
  remove(@CurrentApiToken() token: ApiToken, @Param('id') id: string) {
    return this.appActivityService.remove(token.id, id);
  }
}
