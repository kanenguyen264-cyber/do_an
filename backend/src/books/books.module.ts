import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksService } from './books.service';
import { CategoriesService } from './categories.service';
import { AuthorsService } from './authors.service';
import { PublishersService } from './publishers.service';
import { BooksController } from './books.controller';
import { CategoriesController } from './categories.controller';
import { AuthorsController } from './authors.controller';
import { PublishersController } from './publishers.controller';
import { Book } from './entities/book.entity';
import { Category } from './entities/category.entity';
import { Author } from './entities/author.entity';
import { Publisher } from './entities/publisher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Category, Author, Publisher])],
  controllers: [
    BooksController,
    CategoriesController,
    AuthorsController,
    PublishersController,
  ],
  providers: [BooksService, CategoriesService, AuthorsService, PublishersService],
  exports: [BooksService, CategoriesService, AuthorsService, PublishersService],
})
export class BooksModule {}
