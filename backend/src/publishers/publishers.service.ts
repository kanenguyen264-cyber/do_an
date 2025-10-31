import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublishersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.publisher.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    return this.prisma.publisher.findUnique({ where: { id }, include: { books: true } });
  }

  async create(data: any) {
    return this.prisma.publisher.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.publisher.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.publisher.delete({ where: { id } });
  }
}
