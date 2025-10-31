import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ViolationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.violation.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
        borrowing: { include: { book: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolve(id: string, resolvedBy: string) {
    return this.prisma.violation.update({
      where: { id },
      data: { status: 'RESOLVED', resolvedAt: new Date(), resolvedBy },
    });
  }
}
