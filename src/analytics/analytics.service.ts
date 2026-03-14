import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AnalyticsQueryDto,
  TimelineQueryDto,
  TopQueryDto,
} from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Daily/hourly total duration for browser activities (line/bar chart) */
  async browserTimeline(apiTokenId: string, query: TimelineQueryDto) {
    const interval = query.interval ?? 'day';
    const params: any[] = [apiTokenId];
    let idx = 2;

    let dateFilter = '';
    if (query.from) {
      dateFilter += ` AND "startedAt" >= $${idx}::timestamptz`;
      params.push(query.from);
      idx++;
    }
    if (query.to) {
      dateFilter += ` AND "startedAt" <= $${idx}::timestamptz`;
      params.push(query.to);
      idx++;
    }

    return this.prisma.$queryRawUnsafe<
      { period: string; totalDuration: number; count: number }[]
    >(
      `SELECT
         date_trunc('${interval}', "startedAt") AS "period",
         CAST(SUM(duration) AS INTEGER) AS "totalDuration",
         CAST(COUNT(*) AS INTEGER) AS "count"
       FROM activities
       WHERE "apiTokenId" = $1${dateFilter}
       GROUP BY "period"
       ORDER BY "period"`,
      ...params,
    );
  }

  /** Daily/hourly total duration for app activities (line/bar chart) */
  async appTimeline(apiTokenId: string, query: TimelineQueryDto) {
    const interval = query.interval ?? 'day';
    const params: any[] = [apiTokenId];
    let idx = 2;

    let dateFilter = '';
    if (query.from) {
      dateFilter += ` AND "startedAt" >= $${idx}::timestamptz`;
      params.push(query.from);
      idx++;
    }
    if (query.to) {
      dateFilter += ` AND "startedAt" <= $${idx}::timestamptz`;
      params.push(query.to);
      idx++;
    }

    return this.prisma.$queryRawUnsafe<
      { period: string; totalDuration: number; count: number }[]
    >(
      `SELECT
         date_trunc('${interval}', "startedAt") AS "period",
         CAST(SUM(duration) AS INTEGER) AS "totalDuration",
         CAST(COUNT(*) AS INTEGER) AS "count"
       FROM app_activities
       WHERE "apiTokenId" = $1${dateFilter}
       GROUP BY "period"
       ORDER BY "period"`,
      ...params,
    );
  }

  /** Hour-of-day distribution for app activities (0-23, bar/heatmap chart) */
  async appHourlyDistribution(
    apiTokenId: string,
    query: AnalyticsQueryDto,
  ) {
    const params: any[] = [apiTokenId];
    let idx = 2;

    let dateFilter = '';
    if (query.from) {
      dateFilter += ` AND "startedAt" >= $${idx}::timestamptz`;
      params.push(query.from);
      idx++;
    }
    if (query.to) {
      dateFilter += ` AND "startedAt" <= $${idx}::timestamptz`;
      params.push(query.to);
      idx++;
    }

    return this.prisma.$queryRawUnsafe<
      { hour: number; totalDuration: number; count: number }[]
    >(
      `SELECT
         CAST(EXTRACT(HOUR FROM "startedAt") AS INTEGER) AS "hour",
         CAST(SUM(duration) AS INTEGER) AS "totalDuration",
         CAST(COUNT(*) AS INTEGER) AS "count"
       FROM app_activities
       WHERE "apiTokenId" = $1${dateFilter}
       GROUP BY "hour"
       ORDER BY "hour"`,
      ...params,
    );
  }

  /** Hour-of-day distribution for browser activities (0-23) */
  async browserHourlyDistribution(
    apiTokenId: string,
    query: AnalyticsQueryDto,
  ) {
    const params: any[] = [apiTokenId];
    let idx = 2;

    let dateFilter = '';
    if (query.from) {
      dateFilter += ` AND "startedAt" >= $${idx}::timestamptz`;
      params.push(query.from);
      idx++;
    }
    if (query.to) {
      dateFilter += ` AND "startedAt" <= $${idx}::timestamptz`;
      params.push(query.to);
      idx++;
    }

    return this.prisma.$queryRawUnsafe<
      { hour: number; totalDuration: number; count: number }[]
    >(
      `SELECT
         CAST(EXTRACT(HOUR FROM "startedAt") AS INTEGER) AS "hour",
         CAST(SUM(duration) AS INTEGER) AS "totalDuration",
         CAST(COUNT(*) AS INTEGER) AS "count"
       FROM activities
       WHERE "apiTokenId" = $1${dateFilter}
       GROUP BY "hour"
       ORDER BY "hour"`,
      ...params,
    );
  }

  /** Top N apps by total duration (pie/bar chart) */
  async topApps(apiTokenId: string, query: TopQueryDto) {
    const limit = query.limit ?? 10;
    const params: any[] = [apiTokenId];
    let idx = 2;

    let dateFilter = '';
    if (query.from) {
      dateFilter += ` AND "startedAt" >= $${idx}::timestamptz`;
      params.push(query.from);
      idx++;
    }
    if (query.to) {
      dateFilter += ` AND "startedAt" <= $${idx}::timestamptz`;
      params.push(query.to);
      idx++;
    }

    params.push(limit);

    return this.prisma.$queryRawUnsafe<
      { appName: string; totalDuration: number; count: number }[]
    >(
      `SELECT
         "appName",
         CAST(SUM(duration) AS INTEGER) AS "totalDuration",
         CAST(COUNT(*) AS INTEGER) AS "count"
       FROM app_activities
       WHERE "apiTokenId" = $1${dateFilter}
       GROUP BY "appName"
       ORDER BY "totalDuration" DESC
       LIMIT $${idx}`,
      ...params,
    );
  }

  /** Top N domains by total duration (pie/bar chart) */
  async topDomains(apiTokenId: string, query: TopQueryDto) {
    const limit = query.limit ?? 10;
    const params: any[] = [apiTokenId];
    let idx = 2;

    let dateFilter = '';
    if (query.from) {
      dateFilter += ` AND "startedAt" >= $${idx}::timestamptz`;
      params.push(query.from);
      idx++;
    }
    if (query.to) {
      dateFilter += ` AND "startedAt" <= $${idx}::timestamptz`;
      params.push(query.to);
      idx++;
    }

    params.push(limit);

    return this.prisma.$queryRawUnsafe<
      { domain: string; totalDuration: number; count: number }[]
    >(
      `SELECT
         domain,
         CAST(SUM(duration) AS INTEGER) AS "totalDuration",
         CAST(COUNT(*) AS INTEGER) AS "count"
       FROM activities
       WHERE "apiTokenId" = $1${dateFilter}
       GROUP BY domain
       ORDER BY "totalDuration" DESC
       LIMIT $${idx}`,
      ...params,
    );
  }

  /** Combined daily totals: browser vs apps side-by-side (comparison chart) */
  async dailyCompare(apiTokenId: string, query: AnalyticsQueryDto) {
    const params: any[] = [apiTokenId];
    let idx = 2;

    let dateFilter = '';
    if (query.from) {
      dateFilter += ` AND "startedAt" >= $${idx}::timestamptz`;
      params.push(query.from);
      idx++;
    }
    if (query.to) {
      dateFilter += ` AND "startedAt" <= $${idx}::timestamptz`;
      params.push(query.to);
      idx++;
    }

    return this.prisma.$queryRawUnsafe<
      {
        date: string;
        browserDuration: number;
        appDuration: number;
      }[]
    >(
      `SELECT
         d.date,
         COALESCE(b."totalDuration", 0) AS "browserDuration",
         COALESCE(a."totalDuration", 0) AS "appDuration"
       FROM (
         SELECT date_trunc('day', "startedAt") AS date
         FROM activities WHERE "apiTokenId" = $1${dateFilter}
         UNION
         SELECT date_trunc('day', "startedAt") AS date
         FROM app_activities WHERE "apiTokenId" = $1${dateFilter}
       ) d
       LEFT JOIN (
         SELECT date_trunc('day', "startedAt") AS date,
                CAST(SUM(duration) AS INTEGER) AS "totalDuration"
         FROM activities
         WHERE "apiTokenId" = $1${dateFilter}
         GROUP BY date
       ) b ON b.date = d.date
       LEFT JOIN (
         SELECT date_trunc('day', "startedAt") AS date,
                CAST(SUM(duration) AS INTEGER) AS "totalDuration"
         FROM app_activities
         WHERE "apiTokenId" = $1${dateFilter}
         GROUP BY date
       ) a ON a.date = d.date
       ORDER BY d.date`,
      ...params,
    );
  }
}
