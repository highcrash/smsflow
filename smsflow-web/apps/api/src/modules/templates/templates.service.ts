import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { extractVariables } from '@smsflow/shared';

export interface CreateTemplateDto {
  name: string;
  body: string;
  category?: string;
}

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateTemplateDto) {
    const variables = extractVariables(dto.body);
    return this.prisma.template.create({
      data: { ...dto, userId, variables },
    });
  }

  async list(userId: string) {
    return this.prisma.template.findMany({
      where: { userId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async get(userId: string, id: string) {
    const template = await this.prisma.template.findFirst({ where: { id, userId } });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async update(userId: string, id: string, dto: Partial<CreateTemplateDto>) {
    await this.get(userId, id);
    const variables = dto.body ? extractVariables(dto.body) : undefined;
    return this.prisma.template.update({
      where: { id },
      data: { ...dto, ...(variables && { variables }) },
    });
  }

  async delete(userId: string, id: string) {
    await this.get(userId, id);
    await this.prisma.template.update({ where: { id }, data: { isActive: false } });
    return { message: 'Template deleted successfully' };
  }
}
