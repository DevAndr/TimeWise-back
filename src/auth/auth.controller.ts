import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApiTokenDto } from './dto/create-api-token.dto';
import { randomBytes } from 'crypto';

@ApiTags('API Tokens')
@Controller('api-tokens')
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new API token' })
  async create(@Body() dto: CreateApiTokenDto) {
    const token = randomBytes(32).toString('hex');
    return this.prisma.apiToken.create({
      data: { name: dto.name, token },
    });
  }

  @Get()
  @ApiOperation({ summary: 'List all API tokens' })
  async findAll() {
    return this.prisma.apiToken.findMany({
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke an API token' })
  async remove(@Param('id') id: string) {
    return this.prisma.apiToken.delete({ where: { id } });
  }
}
