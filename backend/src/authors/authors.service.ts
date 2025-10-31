import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthorsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.author.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    return this.prisma.author.findUnique({ where: { id }, include: { books: { include: { book: true } } } });
  }

  async create(data: any) {
    return this.prisma.author.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.author.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.author.delete({ where: { id } });
  }
}
