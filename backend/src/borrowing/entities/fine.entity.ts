import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Borrowing } from './borrowing.entity';

export enum FineStatus {
  PENDING = 'pending',
  PAID = 'paid',
  WAIVED = 'waived',
}

@Entity('fines')
export class Fine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @OneToOne(() => Borrowing, (borrowing) => borrowing.fine, { eager: true })
  @JoinColumn()
  borrowing: Borrowing;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'int' })
  daysOverdue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 5000 })
  dailyRate: number;

  @Column({
    type: 'enum',
    enum: FineStatus,
    default: FineStatus.PENDING,
  })
  status: FineStatus;

  @Column({ type: 'timestamp', nullable: true })
  paidDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
