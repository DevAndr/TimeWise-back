import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertGoalDto } from './dto/upsert-goal.dto';
import { QueryGoalDto } from './dto/query-goal.dto';
import { NotificationGateway } from '../notification/notification.gateway';
import { Prisma } from '@prisma/client';

const HALFWAY_THRESHOLD = 0.5;
const WARNING_THRESHOLD = 0.8;
const EXCEEDED_THRESHOLD = 1.5;

@Injectable()
export class GoalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationGateway,
  ) {}

  private toDateOnly(dateStr?: string): Date {
    const d = dateStr ? new Date(dateStr) : new Date();
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  }

  private checkThresholds(
    apiTokenId: string,
    domain: string,
    previousProgress: number,
    currentProgress: number,
    dailyGoal: number,
  ) {
    const payload = { domain, dailyGoal, currentProgress };

    const thresholds: [number, Parameters<NotificationGateway['notify']>[1]][] = [
      [dailyGoal * HALFWAY_THRESHOLD, 'goal_halfway'],
      [dailyGoal * WARNING_THRESHOLD, 'goal_warning'],
      [dailyGoal, 'goal_reached'],
      [dailyGoal * EXCEEDED_THRESHOLD, 'goal_exceeded'],
    ];

    for (const [threshold, event] of thresholds) {
      if (previousProgress < threshold && currentProgress >= threshold) {
        this.notifications.notify(apiTokenId, event, payload);
      }
    }
  }

  async upsertGoal(apiTokenId: string, dto: UpsertGoalDto) {
    const date = this.toDateOnly();
    return this.prisma.domainGoal.upsert({
      where: {
        apiTokenId_domain_date: { apiTokenId, domain: dto.domain, date },
      },
      update: { dailyGoal: dto.dailyGoal },
      create: {
        domain: dto.domain,
        dailyGoal: dto.dailyGoal,
        date,
        apiTokenId,
      },
    });
  }

  async findAll(apiTokenId: string, query: QueryGoalDto) {
    const where: Prisma.DomainGoalWhereInput = {
      apiTokenId,
      date: this.toDateOnly(query.date),
    };

    if (query.domain) {
      where.domain = query.domain;
    }

    return this.prisma.domainGoal.findMany({
      where,
      orderBy: { domain: 'asc' },
    });
  }

  async addProgress(apiTokenId: string, domain: string, durationSeconds: number) {
    const date = this.toDateOnly();

    const existing = await this.prisma.domainGoal.findUnique({
      where: { apiTokenId_domain_date: { apiTokenId, domain, date } },
    });

    const previousProgress = existing?.currentProgress ?? 0;
    const dailyGoal = existing?.dailyGoal ?? 7200;

    const goal = await this.prisma.domainGoal.upsert({
      where: {
        apiTokenId_domain_date: { apiTokenId, domain, date },
      },
      update: {
        currentProgress: { increment: durationSeconds },
      },
      create: {
        domain,
        dailyGoal: 7200,
        currentProgress: durationSeconds,
        date,
        apiTokenId,
      },
    });

    this.checkThresholds(apiTokenId, domain, previousProgress, goal.currentProgress, dailyGoal);
  }

  async addProgressBatch(apiTokenId: string, entries: { domain: string; duration: number }[]) {
    const aggregated = new Map<string, number>();
    for (const entry of entries) {
      aggregated.set(entry.domain, (aggregated.get(entry.domain) || 0) + entry.duration);
    }

    const date = this.toDateOnly();
    const domains = [...aggregated.keys()];

    const existingGoals = await this.prisma.domainGoal.findMany({
      where: { apiTokenId, date, domain: { in: domains } },
    });
    const existingMap = new Map(existingGoals.map((g) => [g.domain, g]));

    const operations = [...aggregated.entries()].map(([domain, duration]) =>
      this.prisma.domainGoal.upsert({
        where: {
          apiTokenId_domain_date: { apiTokenId, domain, date },
        },
        update: {
          currentProgress: { increment: duration },
        },
        create: {
          domain,
          dailyGoal: 7200,
          currentProgress: duration,
          date,
          apiTokenId,
        },
      }),
    );

    const results = await this.prisma.$transaction(operations);

    for (const goal of results) {
      const existing = existingMap.get(goal.domain);
      const previousProgress = existing?.currentProgress ?? 0;
      const dailyGoal = existing?.dailyGoal ?? 7200;

      this.checkThresholds(apiTokenId, goal.domain, previousProgress, goal.currentProgress, dailyGoal);
    }
  }
}
