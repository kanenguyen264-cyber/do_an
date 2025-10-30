import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../users/entities/user.entity';
import { Category } from '../../books/entities/category.entity';
import { Author } from '../../books/entities/author.entity';
import { Publisher } from '../../books/entities/publisher.entity';
import { Book, BookStatus } from '../../books/entities/book.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
    @InjectRepository(Publisher)
    private publisherRepository: Repository<Publisher>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  async seed() {
    console.log('🌱 Starting database seeding...');

    // Check if data already exists
    const userCount = await this.userRepository.count();
    if (userCount > 0) {
      console.log('⚠️  Database already has data. Skipping seed.');
      return;
    }

    // Create Users
    console.log('👤 Creating users...');
    const hashedPassword = await bcrypt.hash('123456', 10);

    const admin = this.userRepository.create({
      email: 'admin@library.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true,
      maxBorrowLimit: 10,
    });

    const librarian = this.userRepository.create({
      email: 'librarian@library.com',
      password: hashedPassword,
      firstName: 'Librarian',
      lastName: 'Staff',
      role: UserRole.LIBRARIAN,
      isActive: true,
      maxBorrowLimit: 10,
    });

    const reader1 = this.userRepository.create({
      email: 'reader1@library.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.READER,
      isActive: true,
      maxBorrowLimit: 5,
    });

    const reader2 = this.userRepository.create({
      email: 'reader2@library.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: UserRole.READER,
      isActive: true,
      maxBorrowLimit: 5,
    });

    await this.userRepository.save([admin, librarian, reader1, reader2]);
    console.log('✅ Users created');

    // Create Categories
    console.log('📚 Creating categories...');
    const categories = await this.categoryRepository.save([
      { name: 'Science Fiction', description: 'Books about science and future', slug: 'science-fiction' },
      { name: 'Fantasy', description: 'Fantasy and magical worlds', slug: 'fantasy' },
      { name: 'Mystery', description: 'Mystery and detective stories', slug: 'mystery' },
      { name: 'Romance', description: 'Love and romance stories', slug: 'romance' },
      { name: 'Technology', description: 'Technology and programming books', slug: 'technology' },
      { name: 'Business', description: 'Business and entrepreneurship', slug: 'business' },
      { name: 'Self-Help', description: 'Self-improvement books', slug: 'self-help' },
      { name: 'History', description: 'Historical books', slug: 'history' },
    ]);
    console.log('✅ Categories created');

    // Create Authors
    console.log('✍️  Creating authors...');
    const authors = await this.authorRepository.save([
      { name: 'Robert C. Martin', biography: 'Software engineer and author', nationality: 'American' },
      { name: 'Martin Fowler', biography: 'British software developer and author', nationality: 'British' },
      { name: 'Eric Evans', biography: 'Software consultant and author', nationality: 'American' },
      { name: 'Kent Beck', biography: 'Software engineer and creator of XP', nationality: 'American' },
      { name: 'J.K. Rowling', biography: 'British author of Harry Potter', nationality: 'British' },
      { name: 'George R.R. Martin', biography: 'American novelist and screenwriter', nationality: 'American' },
      { name: 'Agatha Christie', biography: 'English writer of detective novels', nationality: 'British' },
      { name: 'Stephen King', biography: 'American author of horror and suspense', nationality: 'American' },
    ]);
    console.log('✅ Authors created');

    // Create Publishers
    console.log('🏢 Creating publishers...');
    const publishers = await this.publisherRepository.save([
      { name: 'Prentice Hall', address: 'New York, USA', email: 'contact@prenticehall.com' },
      { name: "O'Reilly Media", address: 'California, USA', email: 'contact@oreilly.com' },
      { name: 'Addison-Wesley', address: 'Boston, USA', email: 'contact@awprofessional.com' },
      { name: 'Bloomsbury', address: 'London, UK', email: 'contact@bloomsbury.com' },
      { name: 'Penguin Random House', address: 'New York, USA', email: 'contact@penguinrandomhouse.com' },
    ]);
    console.log('✅ Publishers created');

    // Create Books
    console.log('📖 Creating books...');
    const books = [
      {
        title: 'Clean Code',
        isbn: '9780132350884',
        description: 'A Handbook of Agile Software Craftsmanship',
        publishYear: 2008,
        totalCopies: 5,
        availableCopies: 5,
        price: 450000,
        pageCount: 464,
        language: 'English',
        status: BookStatus.AVAILABLE,
        category: categories[4], // Technology
        authors: [authors[0]], // Robert C. Martin
        publisher: publishers[0], // Prentice Hall
      },
      {
        title: 'Refactoring',
        isbn: '9780201485677',
        description: 'Improving the Design of Existing Code',
        publishYear: 1999,
        totalCopies: 3,
        availableCopies: 3,
        price: 520000,
        pageCount: 448,
        language: 'English',
        status: BookStatus.AVAILABLE,
        category: categories[4], // Technology
        authors: [authors[1]], // Martin Fowler
        publisher: publishers[2], // Addison-Wesley
      },
      {
        title: 'Domain-Driven Design',
        isbn: '9780321125217',
        description: 'Tackling Complexity in the Heart of Software',
        publishYear: 2003,
        totalCopies: 4,
        availableCopies: 4,
        price: 580000,
        pageCount: 560,
        language: 'English',
        status: BookStatus.AVAILABLE,
        category: categories[4], // Technology
        authors: [authors[2]], // Eric Evans
        publisher: publishers[2], // Addison-Wesley
      },
      {
        title: 'Harry Potter and the Philosopher\'s Stone',
        isbn: '9780747532699',
        description: 'The first book in the Harry Potter series',
        publishYear: 1997,
        totalCopies: 10,
        availableCopies: 10,
        price: 350000,
        pageCount: 223,
        language: 'English',
        status: BookStatus.AVAILABLE,
        category: categories[1], // Fantasy
        authors: [authors[4]], // J.K. Rowling
        publisher: publishers[3], // Bloomsbury
      },
      {
        title: 'A Game of Thrones',
        isbn: '9780553103540',
        description: 'The first book in A Song of Ice and Fire series',
        publishYear: 1996,
        totalCopies: 6,
        availableCopies: 6,
        price: 420000,
        pageCount: 694,
        language: 'English',
        status: BookStatus.AVAILABLE,
        category: categories[1], // Fantasy
        authors: [authors[5]], // George R.R. Martin
        publisher: publishers[4], // Penguin Random House
      },
      {
        title: 'Murder on the Orient Express',
        isbn: '9780062693662',
        description: 'A classic Hercule Poirot mystery',
        publishYear: 1934,
        totalCopies: 4,
        availableCopies: 4,
        price: 280000,
        pageCount: 256,
        language: 'English',
        status: BookStatus.AVAILABLE,
        category: categories[2], // Mystery
        authors: [authors[6]], // Agatha Christie
        publisher: publishers[4], // Penguin Random House
      },
      {
        title: 'The Shining',
        isbn: '9780385121675',
        description: 'A horror novel about the Overlook Hotel',
        publishYear: 1977,
        totalCopies: 5,
        availableCopies: 5,
        price: 380000,
        pageCount: 447,
        language: 'English',
        status: BookStatus.AVAILABLE,
        category: categories[0], // Science Fiction
        authors: [authors[7]], // Stephen King
        publisher: publishers[4], // Penguin Random House
      },
    ];

    const savedBooks = await this.bookRepository.save(books);
    console.log('✅ Books created');

    // Create Borrowings
    console.log('📖 Creating borrowings...');
    const { Borrowing } = await import('../../borrowing/entities/borrowing.entity');
    const { BorrowingStatus } = await import('../../borrowing/entities/borrowing.entity');
    const borrowingRepository = this.userRepository.manager.getRepository(Borrowing);

    const now = new Date();
    const borrowings = [
      // Active borrowing
      borrowingRepository.create({
        user: reader1,
        book: savedBooks[0], // Clean Code
        borrowDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        dueDate: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
        status: BorrowingStatus.ACTIVE,
        digitalSignature: 'sig_' + Math.random().toString(36).substring(7),
      }),
      // Overdue borrowing
      borrowingRepository.create({
        user: reader2,
        book: savedBooks[1], // Refactoring
        borrowDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        dueDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days overdue
        status: BorrowingStatus.OVERDUE,
        digitalSignature: 'sig_' + Math.random().toString(36).substring(7),
      }),
      // Returned borrowing
      borrowingRepository.create({
        user: reader1,
        book: savedBooks[3], // Harry Potter
        borrowDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000),
        returnDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        status: BorrowingStatus.RETURNED,
        digitalSignature: 'sig_' + Math.random().toString(36).substring(7),
      }),
    ];

    await borrowingRepository.save(borrowings);
    console.log('✅ Borrowings created');

    // Update book availability
    savedBooks[0].availableCopies -= 1;
    savedBooks[1].availableCopies -= 1;
    await this.bookRepository.save([savedBooks[0], savedBooks[1]]);

    // Create Reservations
    console.log('📌 Creating reservations...');
    const { Reservation } = await import('../../borrowing/entities/reservation.entity');
    const { ReservationStatus } = await import('../../borrowing/entities/reservation.entity');
    const reservationRepository = this.userRepository.manager.getRepository(Reservation);

    const reservations = [
      reservationRepository.create({
        user: reader2,
        book: savedBooks[0], // Clean Code (currently borrowed)
        reservationDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        status: ReservationStatus.PENDING,
        queuePosition: 1,
      }),
    ];

    await reservationRepository.save(reservations);
    console.log('✅ Reservations created');

    // Create Fines
    console.log('💰 Creating fines...');
    const { Fine } = await import('../../borrowing/entities/fine.entity');
    const { FineStatus } = await import('../../borrowing/entities/fine.entity');
    const fineRepository = this.userRepository.manager.getRepository(Fine);

    const fines = [
      fineRepository.create({
        user: reader2,
        borrowing: borrowings[1], // Overdue borrowing
        amount: 30000, // 6 days * 5000 VND
        daysOverdue: 6,
        dailyRate: 5000,
        status: FineStatus.PENDING,
      }),
    ];

    await fineRepository.save(fines);
    console.log('✅ Fines created');

    // Create Notifications
    console.log('🔔 Creating notifications...');
    const { Notification } = await import('../../notifications/entities/notification.entity');
    const { NotificationType } = await import('../../notifications/entities/notification.entity');
    const notificationRepository = this.userRepository.manager.getRepository(Notification);

    const notifications = [
      notificationRepository.create({
        user: reader1,
        type: NotificationType.DUE_SOON,
        title: 'Book Due Soon',
        message: 'Your borrowed book "Clean Code" is due in 9 days',
        isRead: false,
      }),
      notificationRepository.create({
        user: reader2,
        type: NotificationType.OVERDUE,
        title: 'Overdue Book',
        message: 'Your book "Refactoring" is 6 days overdue. Please return it as soon as possible.',
        isRead: false,
      }),
      notificationRepository.create({
        user: reader2,
        type: NotificationType.FINE_ADDED,
        title: 'Fine Added',
        message: 'A fine of 30,000 VND has been added to your account.',
        isRead: false,
      }),
      notificationRepository.create({
        user: reader1,
        type: NotificationType.BOOK_RETURNED,
        title: 'Book Returned Successfully',
        message: 'You have successfully returned "Harry Potter and the Philosopher\'s Stone"',
        isRead: true,
        readAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      }),
    ];

    await notificationRepository.save(notifications);
    console.log('✅ Notifications created');

    console.log('\n🎉 Database seeding completed!');
    console.log('\n📋 Sample Accounts:');
    console.log('Admin: admin@library.com / 123456');
    console.log('Librarian: librarian@library.com / 123456');
    console.log('Reader 1: reader1@library.com / 123456 (has 1 active borrowing)');
    console.log('Reader 2: reader2@library.com / 123456 (has 1 overdue book with fine)');
    console.log('\n📊 Sample Data:');
    console.log('- 4 Users');
    console.log('- 8 Categories');
    console.log('- 8 Authors');
    console.log('- 5 Publishers');
    console.log('- 7 Books');
    console.log('- 3 Borrowings (1 active, 1 overdue, 1 returned)');
    console.log('- 1 Reservation');
    console.log('- 1 Fine');
    console.log('- 4 Notifications');
  }
}
