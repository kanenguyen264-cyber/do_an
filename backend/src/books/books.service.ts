import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search?: string, categoryId?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [books, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          publisher: true,
          authors: { include: { author: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.book.count({ where }),
    ]);

    return { data: books, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    return this.prisma.book.findUnique({
      where: { id },
      include: {
        category: true,
        publisher: true,
        authors: { include: { author: true } },
        reviews: { include: { user: { select: { fullName: true, avatar: true } } } },
      },
    });
  }

  async create(data: any) {
    const { authorIds, ...bookData } = data;
    return this.prisma.book.create({
      data: {
        ...bookData,
        authors: authorIds ? { create: authorIds.map((id: string) => ({ authorId: id })) } : undefined,
      },
      include: { category: true, publisher: true, authors: { include: { author: true } } },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.book.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.book.delete({ where: { id } });
  }
}
