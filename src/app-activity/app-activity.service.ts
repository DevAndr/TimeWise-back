import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppActivityDto } from './dto/create-app-activity.dto';
import { QueryAppActivityDto } from './dto/query-app-activity.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AppActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(apiTokenId: string, dto: CreateAppActivityDto) {
    return this.prisma.appActivity.create({
      data: {
        appName: dto.appName,
        windowTitle: dto.windowTitle,
        duration: dto.duration,
        startedAt: new Date(dto.startedAt),
        endedAt: new Date(dto.endedAt),
        apiTokenId,
      },
    });
  }

  async createBatch(apiTokenId: string, dtos: CreateAppActivityDto[]) {
    return this.prisma.appActivity.createMany({
      data: dtos.map((dto) => ({
        appName: dto.appName,
        windowTitle: dto.windowTitle,
        duration: dto.duration,
        startedAt: new Date(dto.startedAt),
        endedAt: new Date(dto.endedAt),
        apiTokenId,
      })),
    });
  }

  async findAll(apiTokenId: string, query: QueryAppActivityDto) {
    const where: Prisma.AppActivityWhereInput = { apiTokenId };

    if (query.appName) {
      where.appName = query.appName;
    }

    if (query.from || query.to) {
      where.startedAt = {};
      if (query.from) where.startedAt.gte = new Date(query.from);
      if (query.to) where.startedAt.lte = new Date(query.to);
    }

    return this.prisma.appActivity.findMany({
      where,
      orderBy: { startedAt: 'desc' },
    });
  }

  async getSummaryByApp(apiTokenId: string, query: QueryAppActivityDto) {
    const where: Prisma.AppActivityWhereInput = { apiTokenId };

    if (query.appName) {
      where.appName = query.appName;
    }

    if (query.from || query.to) {
      where.startedAt = {};
      if (query.from) where.startedAt.gte = new Date(query.from);
      if (query.to) where.startedAt.lte = new Date(query.to);
    }

    return this.prisma.appActivity.groupBy({
      by: ['appName'],
      where,
      _sum: { duration: true },
      _count: { id: true },
      orderBy: { _sum: { duration: 'desc' } },
    });
  }

  async remove(apiTokenId: string, id: string) {
    return this.prisma.appActivity.deleteMany({
      where: { id, apiTokenId },
    });
  }
}
