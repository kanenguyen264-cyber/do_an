import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { Book, BookStatus } from './entities/book.entity';
import { Category } from './entities/category.entity';
import { Author } from './entities/author.entity';
import { Publisher } from './entities/publisher.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Author)
    private authorsRepository: Repository<Author>,
    @InjectRepository(Publisher)
    private publishersRepository: Repository<Publisher>,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    // Check if ISBN already exists
    const existingBook = await this.booksRepository.findOne({
      where: { isbn: createBookDto.isbn },
    });

    if (existingBook) {
      throw new ConflictException('Book with this ISBN already exists');
    }

    // Get category
    const category = await this.categoriesRepository.findOne({
      where: { id: createBookDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Get authors
    const authors = await this.authorsRepository.findBy({
      id: In(createBookDto.authorIds),
    });
    if (authors.length !== createBookDto.authorIds.length) {
      throw new NotFoundException('One or more authors not found');
    }

    // Get publisher
    const publisher = await this.publishersRepository.findOne({
      where: { id: createBookDto.publisherId },
    });
    if (!publisher) {
      throw new NotFoundException('Publisher not found');
    }

    const book = this.booksRepository.create({
      ...createBookDto,
      category,
      authors,
      publisher,
      availableCopies: createBookDto.availableCopies || createBookDto.totalCopies,
    });

    return this.booksRepository.save(book);
  }

  async findAll(filters?: {
    search?: string;
    categoryId?: string;
    authorId?: string;
    publisherId?: string;
    status?: BookStatus;
    page?: number;
    limit?: number;
  }): Promise<{ books: Book[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.booksRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.category', 'category')
      .leftJoinAndSelect('book.authors', 'authors')
      .leftJoinAndSelect('book.publisher', 'publisher');

    if (filters?.search) {
      queryBuilder.where(
        '(book.title ILIKE :search OR book.isbn ILIKE :search OR book.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.categoryId) {
      queryBuilder.andWhere('book.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere('book.status = :status', { status: filters.status });
    }

    const [books, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('book.createdAt', 'DESC')
      .getManyAndCount();

    return { books, total };
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: { id },
      relations: ['category', 'authors', 'publisher'],
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  async findByIsbn(isbn: string): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: { isbn },
      relations: ['category', 'authors', 'publisher'],
    });

    if (!book) {
      throw new NotFoundException(`Book with ISBN ${isbn} not found`);
    }

    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);

    if (updateBookDto.categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: { id: updateBookDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      book.category = category;
    }

    if (updateBookDto.authorIds) {
      const authors = await this.authorsRepository.findBy({
        id: In(updateBookDto.authorIds),
      });
      if (authors.length !== updateBookDto.authorIds.length) {
        throw new NotFoundException('One or more authors not found');
      }
      book.authors = authors;
    }

    if (updateBookDto.publisherId) {
      const publisher = await this.publishersRepository.findOne({
        where: { id: updateBookDto.publisherId },
      });
      if (!publisher) {
        throw new NotFoundException('Publisher not found');
      }
      book.publisher = publisher;
    }

    Object.assign(book, updateBookDto);
    return this.booksRepository.save(book);
  }

  async remove(id: string): Promise<void> {
    const book = await this.findOne(id);
    await this.booksRepository.remove(book);
  }

  async updateAvailability(bookId: string, change: number): Promise<Book> {
    const book = await this.findOne(bookId);
    book.availableCopies += change;

    if (book.availableCopies < 0) {
      throw new ConflictException('Not enough available copies');
    }

    if (book.availableCopies > book.totalCopies) {
      book.availableCopies = book.totalCopies;
    }

    // Update status based on availability
    if (book.availableCopies === 0) {
      book.status = BookStatus.BORROWED;
    } else if (book.availableCopies > 0 && book.status === BookStatus.BORROWED) {
      book.status = BookStatus.AVAILABLE;
    }

    return this.booksRepository.save(book);
  }

  async incrementBorrowCount(bookId: string): Promise<void> {
    await this.booksRepository.increment({ id: bookId }, 'borrowCount', 1);
  }

  async getPopularBooks(limit: number = 10): Promise<Book[]> {
    return this.booksRepository.find({
      order: { borrowCount: 'DESC' },
      take: limit,
      relations: ['category', 'authors', 'publisher'],
    });
  }

  async getNewArrivals(limit: number = 10): Promise<Book[]> {
    return this.booksRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['category', 'authors', 'publisher'],
    });
  }
}
