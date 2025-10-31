import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalBooks, totalUsers, totalBorrowings, activeBorrowings, overdueBorrowings] = await Promise.all([
      this.prisma.book.count(),
      this.prisma.user.count(),
      this.prisma.borrowing.count(),
      this.prisma.borrowing.count({ where: { status: { in: ['PENDING', 'APPROVED', 'BORROWED'] } } }),
      this.prisma.borrowing.count({ where: { status: 'OVERDUE' } }),
    ]);

    return { totalBooks, totalUsers, totalBorrowings, activeBorrowings, overdueBorrowings };
  }

  async getPopularBooks(limit = 10) {
    const borrowings = await this.prisma.borrowing.groupBy({
      by: ['bookId'],
      _count: { bookId: true },
      orderBy: { _count: { bookId: 'desc' } },
      take: limit,
    });

    const bookIds = borrowings.map((b) => b.bookId);
    const books = await this.prisma.book.findMany({
      where: { id: { in: bookIds } },
      include: { category: true, authors: { include: { author: true } } },
    });

    return books.map((book) => ({
      ...book,
      borrowCount: borrowings.find((b) => b.bookId === book.id)?._count.bookId || 0,
    }));
  }
}
