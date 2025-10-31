import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, bookId: string, rating: number, comment?: string) {
    return this.prisma.review.create({
      data: { userId, bookId, rating, comment },
      include: { user: { select: { fullName: true, avatar: true } }, book: true },
    });
  }

  async findByBook(bookId: string) {
    return this.prisma.review.findMany({
      where: { bookId },
      include: { user: { select: { fullName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, rating: number, comment?: string) {
    return this.prisma.review.update({ where: { id }, data: { rating, comment } });
  }

  async remove(id: string) {
    return this.prisma.review.delete({ where: { id } });
  }
}
