import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertGoalDto } from './dto/upsert-goal.dto';
import { QueryGoalDto } from './dto/query-goal.dto';
import { NotificationGateway } from '../notification/notification.gateway';
import { Prisma } from '@prisma/client';

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

    if (previousProgress < dailyGoal && goal.currentProgress >= dailyGoal) {
      this.notifications.notifyGoalReached(apiTokenId, {
        domain,
        dailyGoal: goal.dailyGoal,
        currentProgress: goal.currentProgress,
      });
    }
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

      if (previousProgress < dailyGoal && goal.currentProgress >= dailyGoal) {
        this.notifications.notifyGoalReached(apiTokenId, {
          domain: goal.domain,
          dailyGoal: goal.dailyGoal,
          currentProgress: goal.currentProgress,
        });
      }
    }
  }
}
