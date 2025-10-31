import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { UpdateBorrowingDto } from './dto/update-borrowing.dto';
import { BorrowingStatus } from '@prisma/client';

@Injectable()
export class BorrowingService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createBorrowingDto: CreateBorrowingDto) {
    const { bookId, notes } = createBorrowingDto;

    // Check if user exists and is active
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    if (user.status !== 'ACTIVE') {
      throw new BadRequestException('Tài khoản của bạn đã bị tạm khóa');
    }

    // Check if book exists and is available
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException('Không tìm thấy sách');
    }
    if (book.availableCopies <= 0) {
      throw new BadRequestException('Sách đã hết');
    }

    // Get system config
    const config = await this.prisma.systemConfig.findFirst();
    const maxBooks = config?.maxBooksPerUser || 5;

    // Check if user has reached borrowing limit
    const activeBorrowings = await this.prisma.borrowing.count({
      where: {
        userId,
        status: { in: ['PENDING', 'APPROVED', 'BORROWED'] },
      },
    });

    if (activeBorrowings >= maxBooks) {
      throw new BadRequestException(`Bạn đã đạt giới hạn mượn ${maxBooks} cuốn sách`);
    }

    // Check if user already has a pending/active borrowing for this book
    const existingBorrowing = await this.prisma.borrowing.findFirst({
      where: {
        userId,
        bookId,
        status: { in: ['PENDING', 'APPROVED', 'BORROWED'] },
      },
    });

    if (existingBorrowing) {
      throw new BadRequestException('Bạn đã có yêu cầu mượn sách này');
    }

    // Create borrowing request
    const borrowing = await this.prisma.borrowing.create({
      data: {
        userId,
        bookId,
        notes,
        status: 'PENDING',
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            coverImage: true,
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Create notification
    await this.prisma.notification.create({
      data: {
        userId,
        title: 'Yêu cầu mượn sách',
        message: `Yêu cầu mượn sách "${book.title}" đã được gửi. Vui lòng chờ thủ thư duyệt.`,
        type: 'PENDING',
      },
    });

    // Create activity log
    await this.prisma.activityLog.create({
      data: {
        action: 'CREATE',
        entity: 'BORROWING',
        entityId: borrowing.id,
        description: `${user.fullName} gửi yêu cầu mượn sách "${book.title}"`,
        userId,
      },
    });

    return borrowing;
  }

  async findAll(page = 1, limit = 10, status?: string, userId?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }

    const [borrowings, total] = await Promise.all([
      this.prisma.borrowing.findMany({
        where,
        skip,
        take: limit,
        include: {
          book: {
            select: {
              id: true,
              title: true,
              coverImage: true,
              isbn: true,
            },
          },
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              userCode: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.borrowing.count({ where }),
    ]);

    return {
      data: borrowings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const borrowing = await this.prisma.borrowing.findUnique({
      where: { id },
      include: {
        book: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            userCode: true,
            phone: true,
          },
        },
        violations: true,
      },
    });

    if (!borrowing) {
      throw new NotFoundException('Không tìm thấy phiếu mượn');
    }

    return borrowing;
  }

  async approve(id: string, approverId: string) {
    const borrowing = await this.prisma.borrowing.findUnique({
      where: { id },
      include: { book: true, user: true },
    });

    if (!borrowing) {
      throw new NotFoundException('Không tìm thấy phiếu mượn');
    }

    if (borrowing.status !== 'PENDING') {
      throw new BadRequestException('Chỉ có thể duyệt phiếu mượn đang chờ');
    }

    // Get system config
    const config = await this.prisma.systemConfig.findFirst();
    const borrowDays = config?.defaultBorrowDays || 14;

    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + borrowDays);

    // Update borrowing and book availability
    const [updated] = await this.prisma.$transaction([
      this.prisma.borrowing.update({
        where: { id },
        data: {
          status: 'BORROWED',
          borrowDate,
          dueDate,
        },
        include: {
          book: true,
          user: true,
        },
      }),
      this.prisma.book.update({
        where: { id: borrowing.bookId },
        data: {
          availableCopies: { decrement: 1 },
        },
      }),
    ]);

    // Create notification
    await this.prisma.notification.create({
      data: {
        userId: borrowing.userId,
        title: 'Yêu cầu mượn sách đã được duyệt',
        message: `Yêu cầu mượn sách "${borrowing.book.title}" đã được duyệt. Vui lòng đến thư viện để nhận sách.`,
        type: 'APPROVED',
      },
    });

    // Create activity log
    await this.prisma.activityLog.create({
      data: {
        action: 'APPROVE',
        entity: 'BORROWING',
        entityId: id,
        description: `Duyệt phiếu mượn sách "${borrowing.book.title}" cho ${borrowing.user.fullName}`,
        userId: approverId,
      },
    });

    return updated;
  }

  async reject(id: string, rejecterId: string, reason?: string) {
    const borrowing = await this.prisma.borrowing.findUnique({
      where: { id },
      include: { book: true, user: true },
    });

    if (!borrowing) {
      throw new NotFoundException('Không tìm thấy phiếu mượn');
    }

    if (borrowing.status !== 'PENDING') {
      throw new BadRequestException('Chỉ có thể từ chối phiếu mượn đang chờ');
    }

    const updated = await this.prisma.borrowing.update({
      where: { id },
      data: {
        status: 'REJECTED',
        notes: reason || borrowing.notes,
      },
      include: {
        book: true,
        user: true,
      },
    });

    // Create notification
    await this.prisma.notification.create({
      data: {
        userId: borrowing.userId,
        title: 'Yêu cầu mượn sách bị từ chối',
        message: `Yêu cầu mượn sách "${borrowing.book.title}" đã bị từ chối. ${reason || ''}`,
        type: 'REJECTED',
      },
    });

    // Create activity log
    await this.prisma.activityLog.create({
      data: {
        action: 'REJECT',
        entity: 'BORROWING',
        entityId: id,
        description: `Từ chối phiếu mượn sách "${borrowing.book.title}" của ${borrowing.user.fullName}`,
        userId: rejecterId,
      },
    });

    return updated;
  }

  async return(id: string, returnerId: string) {
    const borrowing = await this.prisma.borrowing.findUnique({
      where: { id },
      include: { book: true, user: true },
    });

    if (!borrowing) {
      throw new NotFoundException('Không tìm thấy phiếu mượn');
    }

    if (borrowing.status !== 'BORROWED') {
      throw new BadRequestException('Chỉ có thể trả sách đang mượn');
    }

    const returnDate = new Date();
    const isLate = returnDate > borrowing.dueDate;

    // Update borrowing and book availability
    const [updated] = await this.prisma.$transaction([
      this.prisma.borrowing.update({
        where: { id },
        data: {
          status: 'RETURNED',
          returnDate,
        },
        include: {
          book: true,
          user: true,
        },
      }),
      this.prisma.book.update({
        where: { id: borrowing.bookId },
        data: {
          availableCopies: { increment: 1 },
        },
      }),
    ]);

    // If late, create violation
    if (isLate) {
      const daysLate = Math.ceil(
        (returnDate.getTime() - borrowing.dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      
      const config = await this.prisma.systemConfig.findFirst();
      const fineAmount = (config?.lateFeePerDay || 5000) * daysLate;

      await this.prisma.violation.create({
        data: {
          userId: borrowing.userId,
          borrowingId: id,
          type: 'LATE_RETURN',
          daysLate,
          fineAmount,
          description: `Trả sách trễ ${daysLate} ngày`,
        },
      });

      // Create notification
      await this.prisma.notification.create({
        data: {
          userId: borrowing.userId,
          title: 'Trả sách trễ hạn',
          message: `Bạn đã trả sách "${borrowing.book.title}" trễ ${daysLate} ngày. Phí phạt: ${fineAmount.toLocaleString('vi-VN')} VNĐ`,
          type: 'OVERDUE',
        },
      });
    } else {
      // Create notification
      await this.prisma.notification.create({
        data: {
          userId: borrowing.userId,
          title: 'Trả sách thành công',
          message: `Bạn đã trả sách "${borrowing.book.title}" đúng hạn. Cảm ơn bạn!`,
          type: 'GENERAL',
        },
      });
    }

    // Create activity log
    await this.prisma.activityLog.create({
      data: {
        action: 'RETURN',
        entity: 'BORROWING',
        entityId: id,
        description: `${borrowing.user.fullName} trả sách "${borrowing.book.title}" ${isLate ? '(trễ hạn)' : '(đúng hạn)'}`,
        userId: returnerId,
      },
    });

    return updated;
  }

  async renew(id: string, userId: string) {
    const borrowing = await this.prisma.borrowing.findUnique({
      where: { id },
      include: { book: true },
    });

    if (!borrowing) {
      throw new NotFoundException('Không tìm thấy phiếu mượn');
    }

    if (borrowing.userId !== userId) {
      throw new BadRequestException('Bạn không có quyền gia hạn phiếu mượn này');
    }

    if (borrowing.status !== 'BORROWED') {
      throw new BadRequestException('Chỉ có thể gia hạn sách đang mượn');
    }

    // Check if overdue
    if (new Date() > borrowing.dueDate) {
      throw new BadRequestException('Không thể gia hạn sách đã quá hạn');
    }

    // Get system config
    const config = await this.prisma.systemConfig.findFirst();
    const maxRenewals = config?.maxRenewalCount || 1;

    if (borrowing.renewalCount >= maxRenewals) {
      throw new BadRequestException(`Bạn đã đạt giới hạn gia hạn (${maxRenewals} lần)`);
    }

    const borrowDays = config?.defaultBorrowDays || 14;
    const newDueDate = new Date(borrowing.dueDate);
    newDueDate.setDate(newDueDate.getDate() + borrowDays);

    const updated = await this.prisma.borrowing.update({
      where: { id },
      data: {
        dueDate: newDueDate,
        renewalCount: { increment: 1 },
      },
      include: {
        book: true,
        user: true,
      },
    });

    // Create notification
    await this.prisma.notification.create({
      data: {
        userId,
        title: 'Gia hạn sách thành công',
        message: `Bạn đã gia hạn sách "${borrowing.book.title}" đến ngày ${newDueDate.toLocaleDateString('vi-VN')}`,
        type: 'GENERAL',
      },
    });

    // Create activity log
    await this.prisma.activityLog.create({
      data: {
        action: 'RENEW',
        entity: 'BORROWING',
        entityId: id,
        description: `Gia hạn sách "${borrowing.book.title}"`,
        userId,
      },
    });

    return updated;
  }

  async checkOverdue() {
    const now = new Date();
    
    // Find all overdue borrowings
    const overdueBorrowings = await this.prisma.borrowing.findMany({
      where: {
        status: 'BORROWED',
        dueDate: { lt: now },
      },
      include: {
        book: true,
        user: true,
      },
    });

    // Update status and send notifications
    for (const borrowing of overdueBorrowings) {
      await this.prisma.borrowing.update({
        where: { id: borrowing.id },
        data: { status: 'OVERDUE' },
      });

      const daysLate = Math.ceil(
        (now.getTime() - borrowing.dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      await this.prisma.notification.create({
        data: {
          userId: borrowing.userId,
          title: 'Sách quá hạn',
          message: `Sách "${borrowing.book.title}" đã quá hạn ${daysLate} ngày. Vui lòng trả sách sớm để tránh bị phạt.`,
          type: 'OVERDUE',
        },
      });
    }

    return { count: overdueBorrowings.length };
  }
}
