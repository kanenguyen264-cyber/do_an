import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BorrowingService } from './borrowing.service';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Borrowing')
@Controller('borrowing')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BorrowingController {
  constructor(private readonly borrowingService: BorrowingService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo yêu cầu mượn sách' })
  async create(@CurrentUser() user: any, @Body() createBorrowingDto: CreateBorrowingDto) {
    return this.borrowingService.create(user.id, createBorrowingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách phiếu mượn' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'userId', required: false })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    return this.borrowingService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      status,
      userId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết phiếu mượn' })
  async findOne(@Param('id') id: string) {
    return this.borrowingService.findOne(id);
  }

  @Put(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Duyệt phiếu mượn' })
  async approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.borrowingService.approve(id, user.id);
  }

  @Put(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Từ chối phiếu mượn' })
  async reject(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('reason') reason?: string,
  ) {
    return this.borrowingService.reject(id, user.id, reason);
  }

  @Put(':id/return')
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Trả sách' })
  async return(@Param('id') id: string, @CurrentUser() user: any) {
    return this.borrowingService.return(id, user.id);
  }

  @Put(':id/renew')
  @ApiOperation({ summary: 'Gia hạn mượn sách' })
  async renew(@Param('id') id: string, @CurrentUser() user: any) {
    return this.borrowingService.renew(id, user.id);
  }

  @Post('check-overdue')
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Kiểm tra sách quá hạn' })
  async checkOverdue() {
    return this.borrowingService.checkOverdue();
  }
}
