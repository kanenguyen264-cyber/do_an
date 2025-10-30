import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { UsersService } from '../users/users.service';
import { BooksService } from '../books/books.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    private usersService: UsersService,
    private booksService: BooksService,
  ) {}

  async create(userId: string, createReservationDto: CreateReservationDto): Promise<Reservation> {
    const user = await this.usersService.findOne(userId);
    const book = await this.booksService.findOne(createReservationDto.bookId);

    // Check if user already has a pending reservation for this book
    const existingReservation = await this.reservationRepository.findOne({
      where: {
        user: { id: userId },
        book: { id: book.id },
        status: ReservationStatus.PENDING,
      },
    });

    if (existingReservation) {
      throw new ConflictException('You already have a pending reservation for this book');
    }

    // Get queue position
    const queuePosition = await this.getQueuePosition(book.id);

    const reservation = this.reservationRepository.create({
      user,
      book,
      reservationDate: new Date(),
      queuePosition,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return this.reservationRepository.save(reservation);
  }

  async findAll(filters?: {
    userId?: string;
    bookId?: string;
    status?: ReservationStatus;
  }): Promise<Reservation[]> {
    const queryBuilder = this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.user', 'user')
      .leftJoinAndSelect('reservation.book', 'book');

    if (filters?.userId) {
      queryBuilder.andWhere('reservation.userId = :userId', { userId: filters.userId });
    }

    if (filters?.bookId) {
      queryBuilder.andWhere('reservation.bookId = :bookId', { bookId: filters.bookId });
    }

    if (filters?.status) {
      queryBuilder.andWhere('reservation.status = :status', { status: filters.status });
    }

    return queryBuilder
      .orderBy('reservation.queuePosition', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['user', 'book'],
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    return reservation;
  }

  async cancel(id: string, userId: string): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.user.id !== userId) {
      throw new BadRequestException('You can only cancel your own reservations');
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Only pending reservations can be cancelled');
    }

    reservation.status = ReservationStatus.CANCELLED;
    const savedReservation = await this.reservationRepository.save(reservation);

    // Update queue positions for other reservations
    await this.updateQueuePositions(reservation.book.id);

    return savedReservation;
  }

  async markAsReady(id: string): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Only pending reservations can be marked as ready');
    }

    reservation.status = ReservationStatus.READY;
    reservation.notifiedDate = new Date();

    return this.reservationRepository.save(reservation);
  }

  async fulfill(id: string): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.READY) {
      throw new BadRequestException('Only ready reservations can be fulfilled');
    }

    reservation.status = ReservationStatus.FULFILLED;
    return this.reservationRepository.save(reservation);
  }

  async checkExpiredReservations(): Promise<void> {
    const expiredReservations = await this.reservationRepository
      .createQueryBuilder('reservation')
      .where('reservation.status = :status', { status: ReservationStatus.READY })
      .andWhere('reservation.expiryDate < :now', { now: new Date() })
      .getMany();

    for (const reservation of expiredReservations) {
      reservation.status = ReservationStatus.EXPIRED;
      await this.reservationRepository.save(reservation);
      await this.updateQueuePositions(reservation.book.id);
    }
  }

  private async getQueuePosition(bookId: string): Promise<number> {
    const count = await this.reservationRepository.count({
      where: {
        book: { id: bookId },
        status: ReservationStatus.PENDING,
      },
    });

    return count + 1;
  }

  private async updateQueuePositions(bookId: string): Promise<void> {
    const reservations = await this.reservationRepository.find({
      where: {
        book: { id: bookId },
        status: ReservationStatus.PENDING,
      },
      order: { reservationDate: 'ASC' },
    });

    for (let i = 0; i < reservations.length; i++) {
      reservations[i].queuePosition = i + 1;
      await this.reservationRepository.save(reservations[i]);
    }
  }
}
