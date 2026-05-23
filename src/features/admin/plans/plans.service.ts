import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/core/database/prisma.service';

import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePlanDto) {
    const existing = await this.prisma.plan.findUnique({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException(`Plano com nome "${dto.name}" já existe`);
    }

    return this.prisma.plan.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        billingCycle: dto.billingCycle,
        maxUsers: dto.maxUsers ?? null,
        maxStorageMb: dto.maxStorageMb ?? null,
        features: dto.features ?? [],
        trialDays: dto.trialDays ?? 0,
        isPublic: dto.isPublic ?? true,
      },
    });
  }

  async findAll(page = 1, limit = 10, onlyActive = false) {
    const skip = (page - 1) * limit;
    const where = onlyActive ? { isActive: true } : {};

    const [data, total] = await Promise.all([
      this.prisma.plan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.plan.count({ where }),
    ]);

    return { data, total, currentPage: page, limit };
  }

  async findOne(id: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plano não encontrado');
    return plan;
  }

  async update(id: string, dto: UpdatePlanDto) {
    await this.findOne(id);

    if (dto.name) {
      const conflict = await this.prisma.plan.findUnique({ where: { name: dto.name } });
      if (conflict && conflict.id !== id) {
        throw new ConflictException(`Plano com nome "${dto.name}" já existe`);
      }
    }

    return this.prisma.plan.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.billingCycle !== undefined && { billingCycle: dto.billingCycle }),
        ...(dto.maxUsers !== undefined && { maxUsers: dto.maxUsers }),
        ...(dto.maxStorageMb !== undefined && { maxStorageMb: dto.maxStorageMb }),
        ...(dto.features !== undefined && { features: dto.features }),
        ...(dto.trialDays !== undefined && { trialDays: dto.trialDays }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
      },
    });
  }

  async deactivate(id: string) {
    await this.findOne(id);
    return this.prisma.plan.update({ where: { id }, data: { isActive: false } });
  }
}
