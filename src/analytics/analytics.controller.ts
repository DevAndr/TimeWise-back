import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsQueryDto,
  TimelineQueryDto,
  TopQueryDto,
} from './dto/analytics-query.dto';
import { ApiTokenGuard } from '../auth/api-token.guard';
import { CurrentApiToken } from '../auth/api-token.decorator';
import { ApiToken } from '@prisma/client';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(ApiTokenGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('browser/timeline')
  @ApiOperation({
    summary: 'Browser activity timeline (daily/hourly totals for line chart)',
  })
  browserTimeline(
    @CurrentApiToken() token: ApiToken,
    @Query() query: TimelineQueryDto,
  ) {
    return this.analyticsService.browserTimeline(token.id, query);
  }

  @Get('apps/timeline')
  @ApiOperation({
    summary: 'App activity timeline (daily/hourly totals for line chart)',
  })
  appTimeline(
    @CurrentApiToken() token: ApiToken,
    @Query() query: TimelineQueryDto,
  ) {
    return this.analyticsService.appTimeline(token.id, query);
  }

  @Get('browser/hourly')
  @ApiOperation({
    summary:
      'Browser activity by hour of day (0-23 distribution for bar/heatmap)',
  })
  browserHourly(
    @CurrentApiToken() token: ApiToken,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.browserHourlyDistribution(token.id, query);
  }

  @Get('apps/hourly')
  @ApiOperation({
    summary:
      'App activity by hour of day (0-23 distribution for bar/heatmap)',
  })
  appHourly(
    @CurrentApiToken() token: ApiToken,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.appHourlyDistribution(token.id, query);
  }

  @Get('top-domains')
  @ApiOperation({ summary: 'Top domains by total time (pie/bar chart)' })
  topDomains(
    @CurrentApiToken() token: ApiToken,
    @Query() query: TopQueryDto,
  ) {
    return this.analyticsService.topDomains(token.id, query);
  }

  @Get('top-apps')
  @ApiOperation({ summary: 'Top apps by total time (pie/bar chart)' })
  topApps(
    @CurrentApiToken() token: ApiToken,
    @Query() query: TopQueryDto,
  ) {
    return this.analyticsService.topApps(token.id, query);
  }

  @Get('daily-compare')
  @ApiOperation({
    summary:
      'Daily comparison: browser vs app time side-by-side (comparison chart)',
  })
  dailyCompare(
    @CurrentApiToken() token: ApiToken,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.dailyCompare(token.id, query);
  }
}
