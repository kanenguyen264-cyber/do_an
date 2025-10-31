import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search?: string, role?: string, status?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { userCode: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    if (status) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          userCode: true,
          userType: true,
          role: true,
          status: true,
          phone: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        userCode: true,
        userType: true,
        role: true,
        status: true,
        phone: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        borrowings: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                coverImage: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        violations: {
          include: {
            borrowing: {
              include: {
                book: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Check if email or userCode is being changed and already exists
    if (updateUserDto.email || updateUserDto.userCode) {
      const existing = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                updateUserDto.email ? { email: updateUserDto.email } : {},
                updateUserDto.userCode ? { userCode: updateUserDto.userCode } : {},
              ],
            },
          ],
        },
      });

      if (existing) {
        throw new BadRequestException('Email hoặc mã người dùng đã tồn tại');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        fullName: true,
        userCode: true,
        userType: true,
        role: true,
        status: true,
        phone: true,
        avatar: true,
        updatedAt: true,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        action: 'UPDATE',
        entity: 'USER',
        entityId: id,
        description: `Cập nhật thông tin người dùng ${updated.fullName}`,
        userId: id,
      },
    });

    return updated;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Check if user has active borrowings
    const activeBorrowings = await this.prisma.borrowing.count({
      where: {
        userId: id,
        status: { in: ['PENDING', 'APPROVED', 'BORROWED'] },
      },
    });

    if (activeBorrowings > 0) {
      throw new BadRequestException('Không thể xóa người dùng đang có sách mượn');
    }

    await this.prisma.user.delete({ where: { id } });

    await this.prisma.activityLog.create({
      data: {
        action: 'DELETE',
        entity: 'USER',
        entityId: id,
        description: `Xóa người dùng ${user.fullName}`,
      },
    });

    return { message: 'Xóa người dùng thành công' };
  }

  async getBorrowingHistory(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [borrowings, total] = await Promise.all([
      this.prisma.borrowing.findMany({
        where: { userId },
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
          violations: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.borrowing.count({ where: { userId } }),
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
}
