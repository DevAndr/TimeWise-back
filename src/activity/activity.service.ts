import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { QueryActivityDto } from './dto/query-activity.dto';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(apiTokenId: string, dto: CreateActivityDto) {
    return this.prisma.activity.upsert({
      where: {
        apiTokenId_domain: { apiTokenId, domain: dto.domain },
      },
      create: {
        domain: dto.domain,
        url: dto.url,
        title: dto.title,
        duration: dto.duration,
        startedAt: new Date(dto.startedAt),
        endedAt: dto.endedAt ? new Date(dto.endedAt) : null,
        apiTokenId,
      },
      update: {
        duration: { increment: dto.duration },
        url: dto.url ?? undefined,
        title: dto.title ?? undefined,
        endedAt: dto.endedAt ? new Date(dto.endedAt) : undefined,
      },
    });
  }

  async createBatch(apiTokenId: string, dtos: CreateActivityDto[]) {
    return Promise.all(
      dtos.map((dto) => this.create(apiTokenId, dto)),
    );
  }

  async findAll(apiTokenId: string, query: QueryActivityDto) {
    const where: Prisma.ActivityWhereInput = { apiTokenId };

    if (query.domain) {
      where.domain = query.domain;
    }

    if (query.from || query.to) {
      where.startedAt = {};
      if (query.from) where.startedAt.gte = new Date(query.from);
      if (query.to) where.startedAt.lte = new Date(query.to);
    }

    return this.prisma.activity.findMany({
      where,
      orderBy: { startedAt: 'desc' },
    });
  }

  async getSummaryByDomain(apiTokenId: string, query: QueryActivityDto) {
    const where: Prisma.ActivityWhereInput = { apiTokenId };

    if (query.domain) {
      where.domain = query.domain;
    }

    if (query.from || query.to) {
      where.startedAt = {};
      if (query.from) where.startedAt.gte = new Date(query.from);
      if (query.to) where.startedAt.lte = new Date(query.to);
    }

    return this.prisma.activity.groupBy({
      by: ['domain'],
      where,
      _sum: { duration: true },
      _count: { id: true },
      orderBy: { _sum: { duration: 'desc' } },
    });
  }

  async remove(apiTokenId: string, id: string) {
    return this.prisma.activity.deleteMany({
      where: { id, apiTokenId },
    });
  }
}
