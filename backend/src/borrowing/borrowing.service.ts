import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Borrowing, BorrowingStatus } from './entities/borrowing.entity';
import { Fine, FineStatus } from './entities/fine.entity';
import { UsersService } from '../users/users.service';
import { BooksService } from '../books/books.service';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { ReturnBorrowingDto } from './dto/return-borrowing.dto';
import * as crypto from 'crypto';

@Injectable()
export class BorrowingService {
  constructor(
    @InjectRepository(Borrowing)
    private borrowingRepository: Repository<Borrowing>,
    @InjectRepository(Fine)
    private fineRepository: Repository<Fine>,
    private usersService: UsersService,
    private booksService: BooksService,
  ) {}

  async create(createBorrowingDto: CreateBorrowingDto): Promise<Borrowing> {
    const user = await this.usersService.findOne(createBorrowingDto.userId);
    const book = await this.booksService.findOne(createBorrowingDto.bookId);

    // Check if user has reached borrow limit
    if (user.currentBorrowCount >= user.maxBorrowLimit) {
      throw new BadRequestException('User has reached maximum borrow limit');
    }

    // Check if book is available
    if (book.availableCopies <= 0) {
      throw new ConflictException('Book is not available for borrowing');
    }

    // Check if user already has an active borrowing for this book
    const existingBorrowing = await this.borrowingRepository.findOne({
      where: {
        user: { id: user.id },
        book: { id: book.id },
        status: BorrowingStatus.ACTIVE,
      },
    });

    if (existingBorrowing) {
      throw new ConflictException('User already has an active borrowing for this book');
    }

    // Calculate due date (14 days from now)
    const borrowDate = new Date();
    const dueDate = createBorrowingDto.dueDate
      ? new Date(createBorrowingDto.dueDate)
      : new Date(borrowDate.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Create digital signature
    const signature = this.generateDigitalSignature({
      userId: user.id,
      bookId: book.id,
      borrowDate: borrowDate.toISOString(),
    });

    const borrowing = this.borrowingRepository.create({
      user,
      book,
      borrowDate,
      dueDate,
      notes: createBorrowingDto.notes,
      digitalSignature: signature,
    });

    const savedBorrowing = await this.borrowingRepository.save(borrowing);

    // Update book availability
    await this.booksService.updateAvailability(book.id, -1);
    await this.booksService.incrementBorrowCount(book.id);

    // Update user borrow count
    await this.usersService.incrementBorrowCount(user.id, 1);

    return savedBorrowing;
  }

  async findAll(filters?: {
    userId?: string;
    bookId?: string;
    status?: BorrowingStatus;
    page?: number;
    limit?: number;
  }): Promise<{ borrowings: Borrowing[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.borrowingRepository
      .createQueryBuilder('borrowing')
      .leftJoinAndSelect('borrowing.user', 'user')
      .leftJoinAndSelect('borrowing.book', 'book')
      .leftJoinAndSelect('borrowing.fine', 'fine');

    if (filters?.userId) {
      queryBuilder.andWhere('borrowing.userId = :userId', { userId: filters.userId });
    }

    if (filters?.bookId) {
      queryBuilder.andWhere('borrowing.bookId = :bookId', { bookId: filters.bookId });
    }

    if (filters?.status) {
      queryBuilder.andWhere('borrowing.status = :status', { status: filters.status });
    }

    const [borrowings, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('borrowing.borrowDate', 'DESC')
      .getManyAndCount();

    return { borrowings, total };
  }

  async findOne(id: string): Promise<Borrowing> {
    const borrowing = await this.borrowingRepository.findOne({
      where: { id },
      relations: ['user', 'book', 'fine'],
    });

    if (!borrowing) {
      throw new NotFoundException(`Borrowing with ID ${id} not found`);
    }

    return borrowing;
  }

  async returnBook(id: string, returnDto: ReturnBorrowingDto): Promise<Borrowing> {
    const borrowing = await this.findOne(id);

    if (borrowing.status !== BorrowingStatus.ACTIVE) {
      throw new BadRequestException('This borrowing is not active');
    }

    const returnDate = new Date();
    borrowing.returnDate = returnDate;
    borrowing.status = BorrowingStatus.RETURNED;

    if (returnDto.notes) {
      borrowing.notes = `${borrowing.notes || ''}\nReturn notes: ${returnDto.notes}`;
    }

    // Check if overdue and create fine
    if (returnDate > borrowing.dueDate) {
      const daysOverdue = Math.ceil(
        (returnDate.getTime() - borrowing.dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      await this.createFine(borrowing, daysOverdue);
      borrowing.status = BorrowingStatus.OVERDUE;
    }

    const savedBorrowing = await this.borrowingRepository.save(borrowing);

    // Update book availability
    await this.booksService.updateAvailability(borrowing.book.id, 1);

    // Update user borrow count
    await this.usersService.incrementBorrowCount(borrowing.user.id, -1);

    return savedBorrowing;
  }

  async renewBorrowing(id: string): Promise<Borrowing> {
    const borrowing = await this.findOne(id);

    if (borrowing.status !== BorrowingStatus.ACTIVE) {
      throw new BadRequestException('Only active borrowings can be renewed');
    }

    if (borrowing.renewCount >= borrowing.maxRenewals) {
      throw new BadRequestException('Maximum renewal limit reached');
    }

    // Extend due date by 14 days
    borrowing.dueDate = new Date(borrowing.dueDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    borrowing.renewCount += 1;

    return this.borrowingRepository.save(borrowing);
  }

  async checkOverdueBorrowings(): Promise<void> {
    const overdueBorrowings = await this.borrowingRepository.find({
      where: {
        status: BorrowingStatus.ACTIVE,
        dueDate: LessThan(new Date()),
      },
      relations: ['user', 'book'],
    });

    for (const borrowing of overdueBorrowings) {
      borrowing.status = BorrowingStatus.OVERDUE;
      await this.borrowingRepository.save(borrowing);

      // Create fine if not exists
      const existingFine = await this.fineRepository.findOne({
        where: { borrowing: { id: borrowing.id } },
      });

      if (!existingFine) {
        const daysOverdue = Math.ceil(
          (new Date().getTime() - borrowing.dueDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        await this.createFine(borrowing, daysOverdue);
      }
    }
  }

  private async createFine(borrowing: Borrowing, daysOverdue: number): Promise<Fine> {
    const dailyRate = 5000; // 5000 VND per day
    const amount = daysOverdue * dailyRate;

    const fine = this.fineRepository.create({
      user: borrowing.user,
      borrowing,
      amount,
      daysOverdue,
      dailyRate,
    });

    return this.fineRepository.save(fine);
  }

  private generateDigitalSignature(data: any): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(data))
      .digest('hex');
  }

  async getUserBorrowingHistory(userId: string): Promise<Borrowing[]> {
    return this.borrowingRepository.find({
      where: { user: { id: userId } },
      relations: ['book', 'fine'],
      order: { borrowDate: 'DESC' },
    });
  }

  async getStatistics() {
    const totalBorrowings = await this.borrowingRepository.count();
    const activeBorrowings = await this.borrowingRepository.count({
      where: { status: BorrowingStatus.ACTIVE },
    });
    const overdueBorrowings = await this.borrowingRepository.count({
      where: { status: BorrowingStatus.OVERDUE },
    });
    const returnedBorrowings = await this.borrowingRepository.count({
      where: { status: BorrowingStatus.RETURNED },
    });

    return {
      total: totalBorrowings,
      active: activeBorrowings,
      overdue: overdueBorrowings,
      returned: returnedBorrowings,
    };
  }
}
