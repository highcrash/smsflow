import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as XLSX from 'xlsx';

export interface CreateContactDto {
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  tags?: string[];
}

export interface UpdateContactDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  tags?: string[];
}

export interface ContactFilters {
  search?: string;
  groupId?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string, filters: ContactFilters = {}) {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { phoneNumber: { contains: filters.search } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }

    if (filters.groupId) {
      where.groupMembers = { some: { groupId: filters.groupId } };
    }

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          groupMembers: {
            include: { group: { select: { id: true, name: true, color: true } } },
          },
        },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return {
      data: contacts,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(userId: string, dto: CreateContactDto) {
    const existing = await this.prisma.contact.findUnique({
      where: { userId_phoneNumber: { userId, phoneNumber: dto.phoneNumber } },
    });
    if (existing) throw new ConflictException('Contact with this phone number already exists');

    return this.prisma.contact.create({
      data: { userId, ...dto, tags: dto.tags ?? [] },
    });
  }

  async get(userId: string, id: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, userId },
      include: {
        groupMembers: {
          include: { group: { select: { id: true, name: true, color: true } } },
        },
      },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async update(userId: string, id: string, dto: UpdateContactDto) {
    const contact = await this.prisma.contact.findFirst({ where: { id, userId } });
    if (!contact) throw new NotFoundException('Contact not found');
    return this.prisma.contact.update({ where: { id }, data: dto });
  }

  async delete(userId: string, id: string) {
    const contact = await this.prisma.contact.findFirst({ where: { id, userId } });
    if (!contact) throw new NotFoundException('Contact not found');
    await this.prisma.contact.delete({ where: { id } });
    return { message: 'Contact deleted' };
  }

  async importFromExcel(userId: string, buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of rows) {
      const phoneNumber = String(
        row.phoneNumber || row.phone || row.Phone || row.PhoneNumber || '',
      ).trim();
      if (!phoneNumber) {
        skipped++;
        continue;
      }

      try {
        await this.prisma.contact.upsert({
          where: { userId_phoneNumber: { userId, phoneNumber } },
          create: {
            userId,
            phoneNumber,
            firstName: row.firstName || row.first_name || row['First Name'] || null,
            lastName: row.lastName || row.last_name || row['Last Name'] || null,
            email: row.email || row.Email || null,
            company: row.company || row.Company || null,
            tags: row.tags ? String(row.tags).split(',').map((t: string) => t.trim()) : [],
          },
          update: {
            firstName: row.firstName || row.first_name || row['First Name'] || undefined,
            lastName: row.lastName || row.last_name || row['Last Name'] || undefined,
            email: row.email || row.Email || undefined,
            company: row.company || row.Company || undefined,
          },
        });
        imported++;
      } catch (e: any) {
        errors.push(`Row ${imported + skipped + 1}: ${e.message}`);
        skipped++;
      }
    }

    return { imported, skipped, errors };
  }

  // Groups
  async listGroups(userId: string) {
    return this.prisma.contactGroup.findMany({
      where: { userId },
      include: { _count: { select: { members: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createGroup(userId: string, name: string, color?: string) {
    return this.prisma.contactGroup.create({
      data: { userId, name, color: color ?? '#10B981' },
    });
  }

  async addToGroup(userId: string, groupId: string, contactIds: string[]) {
    const group = await this.prisma.contactGroup.findFirst({ where: { id: groupId, userId } });
    if (!group) throw new NotFoundException('Group not found');

    await this.prisma.contactGroupMember.createMany({
      data: contactIds.map((contactId) => ({ contactId, groupId })),
      skipDuplicates: true,
    });
    return { added: contactIds.length };
  }

  async deleteGroup(userId: string, groupId: string) {
    const group = await this.prisma.contactGroup.findFirst({ where: { id: groupId, userId } });
    if (!group) throw new NotFoundException('Group not found');
    await this.prisma.contactGroup.delete({ where: { id: groupId } });
    return { message: 'Group deleted' };
  }
}

