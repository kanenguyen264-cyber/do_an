import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BorrowingService } from './borrowing.service';
import { ReservationsService } from './reservations.service';
import { FinesService } from './fines.service';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { ReturnBorrowingDto } from './dto/return-borrowing.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { BorrowingStatus } from './entities/borrowing.entity';
import { ReservationStatus } from './entities/reservation.entity';
import { FineStatus } from './entities/fine.entity';

@ApiTags('Borrowing')
@Controller('borrowing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BorrowingController {
  constructor(
    private readonly borrowingService: BorrowingService,
    private readonly reservationsService: ReservationsService,
    private readonly finesService: FinesService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Create a new borrowing (Admin/Librarian only)' })
  create(@Body() createBorrowingDto: CreateBorrowingDto) {
    return this.borrowingService.create(createBorrowingDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Get all borrowings (Admin/Librarian only)' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'bookId', required: false })
  @ApiQuery({ name: 'status', enum: BorrowingStatus, required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('userId') userId?: string,
    @Query('bookId') bookId?: string,
    @Query('status') status?: BorrowingStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.borrowingService.findAll({ userId, bookId, status, page, limit });
  }

  @Post('borrow')
  @UseGuards(RolesGuard)
  @Roles(UserRole.READER)
  @ApiOperation({ summary: 'Borrow a book (Reader only)' })
  borrowBook(@CurrentUser() user: any, @Body() createBorrowingDto: CreateBorrowingDto) {
    // Override userId with current user
    createBorrowingDto.userId = user.userId;
    return this.borrowingService.create(createBorrowingDto);
  }

  @Get('my-borrowings')
  @ApiOperation({ summary: 'Get current user borrowing history' })
  getMyBorrowings(@CurrentUser() user: any) {
    return this.borrowingService.getUserBorrowingHistory(user.userId);
  }

  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Get borrowing statistics (Admin/Librarian only)' })
  getStatistics() {
    return this.borrowingService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get borrowing by ID' })
  findOne(@Param('id') id: string) {
    return this.borrowingService.findOne(id);
  }

  @Patch(':id/return')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Return a book (Admin/Librarian only)' })
  returnBook(@Param('id') id: string, @Body() returnDto: ReturnBorrowingDto) {
    return this.borrowingService.returnBook(id, returnDto);
  }

  @Patch(':id/renew')
  @ApiOperation({ summary: 'Renew a borrowing' })
  renewBorrowing(@Param('id') id: string) {
    return this.borrowingService.renewBorrowing(id);
  }
}

@ApiTags('Reservations')
@Controller('reservations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reservation' })
  create(@CurrentUser() user: any, @Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(user.userId, createReservationDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Get all reservations (Admin/Librarian only)' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'bookId', required: false })
  @ApiQuery({ name: 'status', enum: ReservationStatus, required: false })
  findAll(
    @Query('userId') userId?: string,
    @Query('bookId') bookId?: string,
    @Query('status') status?: ReservationStatus,
  ) {
    return this.reservationsService.findAll({ userId, bookId, status });
  }

  @Get('my-reservations')
  @ApiOperation({ summary: 'Get current user reservations' })
  getMyReservations(@CurrentUser() user: any) {
    return this.reservationsService.findAll({ userId: user.userId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reservation by ID' })
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a reservation' })
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reservationsService.cancel(id, user.userId);
  }

  @Patch(':id/ready')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Mark reservation as ready (Admin/Librarian only)' })
  markAsReady(@Param('id') id: string) {
    return this.reservationsService.markAsReady(id);
  }

  @Patch(':id/fulfill')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Fulfill a reservation (Admin/Librarian only)' })
  fulfill(@Param('id') id: string) {
    return this.reservationsService.fulfill(id);
  }
}

@ApiTags('Fines')
@Controller('fines')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FinesController {
  constructor(private readonly finesService: FinesService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
  @ApiOperation({ summary: 'Get all fines (Admin/Librarian only)' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'status', enum: FineStatus, required: false })
  findAll(@Query('userId') userId?: string, @Query('status') status?: FineStatus) {
    return this.finesService.findAll({ userId, status });
  }

  @Get('my-fines')
  @ApiOperation({ summary: 'Get current user fines' })
  getMyFines(@CurrentUser() user: any) {
    return this.finesService.getUserFines(user.userId);
  }

  @Get('my-total')
  @ApiOperation({ summary: 'Get current user total unpaid fines' })
  getMyTotal(@CurrentUser() user: any) {
    return this.finesService.getTotalUnpaidFines(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get fine by ID' })
  findOne(@Param('id') id: string) {
    return this.finesService.findOne(id);
  }

  @Patch(':id/pay')
  @ApiOperation({ summary: 'Pay a fine' })
  payFine(@Param('id') id: string) {
    return this.finesService.payFine(id);
  }

  @Patch(':id/waive')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Waive a fine (Admin only)' })
  waiveFine(@Param('id') id: string, @Body('notes') notes?: string) {
    return this.finesService.waiveFine(id, notes);
  }
}
