import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../books/entities/category.entity';
import { Author } from '../../books/entities/author.entity';
import { Publisher } from '../../books/entities/publisher.entity';
import { Book } from '../../books/entities/book.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Category, Author, Publisher, Book]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
