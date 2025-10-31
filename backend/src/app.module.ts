import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthorsModule } from './authors/authors.module';
import { PublishersModule } from './publishers/publishers.module';
import { BorrowingModule } from './borrowing/borrowing.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ViolationsModule } from './violations/violations.module';
import { SystemConfigModule } from './system-config/system-config.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    BooksModule,
    CategoriesModule,
    AuthorsModule,
    PublishersModule,
    BorrowingModule,
    ReviewsModule,
    NotificationsModule,
    ViolationsModule,
    SystemConfigModule,
    ActivityLogsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
