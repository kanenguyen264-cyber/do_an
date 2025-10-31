import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create system config
  const config = await prisma.systemConfig.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      libraryName: 'Thư viện Trường Đại học',
      libraryDescription: 'Hệ thống quản lý thư viện hiện đại',
      workingHours: 'Thứ 2 - Thứ 6: 8:00 - 17:00',
      contactEmail: 'library@university.edu.vn',
      contactPhone: '0123456789',
      maxBooksPerUser: 5,
      defaultBorrowDays: 14,
      maxRenewalCount: 1,
      lateFeePerDay: 5000,
      damageFeePercentage: 20,
    },
  });
  console.log('✅ System config created');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@library.com' },
    update: {},
    create: {
      email: 'admin@library.com',
      password: hashedPassword,
      fullName: 'Quản trị viên',
      userCode: 'ADMIN001',
      userType: 'TEACHER',
      role: 'ADMIN',
      status: 'ACTIVE',
      phone: '0123456789',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create librarian
  const librarian = await prisma.user.upsert({
    where: { email: 'librarian@library.com' },
    update: {},
    create: {
      email: 'librarian@library.com',
      password: hashedPassword,
      fullName: 'Thủ thư',
      userCode: 'LIB001',
      userType: 'TEACHER',
      role: 'LIBRARIAN',
      status: 'ACTIVE',
      phone: '0987654321',
    },
  });
  console.log('✅ Librarian created:', librarian.email);

  // Create sample reader
  const reader = await prisma.user.upsert({
    where: { email: 'reader@library.com' },
    update: {},
    create: {
      email: 'reader@library.com',
      password: hashedPassword,
      fullName: 'Nguyễn Văn A',
      userCode: 'SV001',
      userType: 'STUDENT',
      role: 'READER',
      status: 'ACTIVE',
      phone: '0111222333',
    },
  });
  console.log('✅ Reader created:', reader.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Công nghệ thông tin' },
      update: {},
      create: { name: 'Công nghệ thông tin', description: 'Sách về lập trình, AI, ML' },
    }),
    prisma.category.upsert({
      where: { name: 'Văn học' },
      update: {},
      create: { name: 'Văn học', description: 'Tiểu thuyết, thơ ca' },
    }),
    prisma.category.upsert({
      where: { name: 'Khoa học' },
      update: {},
      create: { name: 'Khoa học', description: 'Vật lý, hóa học, sinh học' },
    }),
    prisma.category.upsert({
      where: { name: 'Kinh tế' },
      update: {},
      create: { name: 'Kinh tế', description: 'Quản trị, tài chính, marketing' },
    }),
  ]);
  console.log('✅ Categories created:', categories.length);

  // Create authors
  const authors = await Promise.all([
    prisma.author.upsert({
      where: { id: '1' },
      update: {},
      create: { id: '1', name: 'Robert C. Martin', bio: 'Software engineer and author' },
    }),
    prisma.author.upsert({
      where: { id: '2' },
      update: {},
      create: { id: '2', name: 'Martin Fowler', bio: 'Software developer and author' },
    }),
    prisma.author.upsert({
      where: { id: '3' },
      update: {},
      create: { id: '3', name: 'Nguyễn Nhật Ánh', bio: 'Nhà văn Việt Nam' },
    }),
  ]);
  console.log('✅ Authors created:', authors.length);

  // Create publishers
  const publishers = await Promise.all([
    prisma.publisher.upsert({
      where: { id: '1' },
      update: {},
      create: { id: '1', name: 'NXB Trẻ', address: 'TP.HCM' },
    }),
    prisma.publisher.upsert({
      where: { id: '2' },
      update: {},
      create: { id: '2', name: "O'Reilly Media", address: 'USA' },
    }),
  ]);
  console.log('✅ Publishers created:', publishers.length);

  // Create books
  const books = await Promise.all([
    prisma.book.upsert({
      where: { isbn: '978-0132350884' },
      update: {},
      create: {
        title: 'Clean Code',
        isbn: '978-0132350884',
        description: 'A Handbook of Agile Software Craftsmanship',
        publishYear: 2008,
        totalCopies: 5,
        availableCopies: 5,
        shelfLocation: 'A1-01',
        categoryId: categories[0].id,
        publisherId: publishers[1].id,
        authors: {
          create: [{ authorId: authors[0].id }],
        },
      },
    }),
    prisma.book.upsert({
      where: { isbn: '978-0201633610' },
      update: {},
      create: {
        title: 'Design Patterns',
        isbn: '978-0201633610',
        description: 'Elements of Reusable Object-Oriented Software',
        publishYear: 1994,
        totalCopies: 3,
        availableCopies: 3,
        shelfLocation: 'A1-02',
        categoryId: categories[0].id,
        publisherId: publishers[1].id,
        authors: {
          create: [{ authorId: authors[1].id }],
        },
      },
    }),
    prisma.book.upsert({
      where: { isbn: '978-6041234567' },
      update: {},
      create: {
        title: 'Mắt Biếc',
        isbn: '978-6041234567',
        description: 'Tiểu thuyết của Nguyễn Nhật Ánh',
        publishYear: 2010,
        totalCopies: 10,
        availableCopies: 10,
        shelfLocation: 'B2-15',
        categoryId: categories[1].id,
        publisherId: publishers[0].id,
        authors: {
          create: [{ authorId: authors[2].id }],
        },
      },
    }),
  ]);
  console.log('✅ Books created:', books.length);

  console.log('🎉 Seeding completed!');
  console.log('\n📝 Login credentials:');
  console.log('Admin: admin@library.com / admin123');
  console.log('Librarian: librarian@library.com / admin123');
  console.log('Reader: reader@library.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
