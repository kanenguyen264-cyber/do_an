import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowingService } from './borrowing.service';
import { ReservationsService } from './reservations.service';
import { FinesService } from './fines.service';
import { BorrowingController, ReservationsController, FinesController } from './borrowing.controller';
import { Borrowing } from './entities/borrowing.entity';
import { Reservation } from './entities/reservation.entity';
import { Fine } from './entities/fine.entity';
import { UsersModule } from '../users/users.module';
import { BooksModule } from '../books/books.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Borrowing, Reservation, Fine]),
    UsersModule,
    BooksModule,
  ],
  controllers: [BorrowingController, ReservationsController, FinesController],
  providers: [BorrowingService, ReservationsService, FinesService],
  exports: [BorrowingService, ReservationsService, FinesService],
})
export class BorrowingModule {}
