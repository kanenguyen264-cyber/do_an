import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(
    user: User,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: any,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      user,
      type,
      title,
      message,
      metadata,
    });

    return this.notificationRepository.save(notification);
  }

  async findAll(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    if (unreadOnly) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead: false });
    }

    return queryBuilder.orderBy('notification.createdAt', 'DESC').getMany();
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    
    if (notification && !notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      return this.notificationRepository.save(notification);
    }

    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { user: { id: userId }, isRead: false },
    });
  }

  async sendDueSoonNotification(user: User, bookTitle: string, dueDate: Date): Promise<void> {
    await this.create(
      user,
      NotificationType.DUE_SOON,
      'Book Due Soon',
      `Your borrowed book "${bookTitle}" is due on ${dueDate.toLocaleDateString()}`,
      { bookTitle, dueDate },
    );
  }

  async sendOverdueNotification(user: User, bookTitle: string, daysOverdue: number): Promise<void> {
    await this.create(
      user,
      NotificationType.OVERDUE,
      'Overdue Book',
      `Your borrowed book "${bookTitle}" is ${daysOverdue} days overdue. Please return it as soon as possible.`,
      { bookTitle, daysOverdue },
    );
  }

  async sendReservationReadyNotification(user: User, bookTitle: string): Promise<void> {
    await this.create(
      user,
      NotificationType.RESERVATION_READY,
      'Reserved Book Available',
      `Your reserved book "${bookTitle}" is now available for pickup.`,
      { bookTitle },
    );
  }

  async sendFineAddedNotification(user: User, amount: number): Promise<void> {
    await this.create(
      user,
      NotificationType.FINE_ADDED,
      'Fine Added',
      `A fine of ${amount.toLocaleString()} VND has been added to your account.`,
      { amount },
    );
  }
}
