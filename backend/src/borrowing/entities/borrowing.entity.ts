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
import { Book } from '../../books/entities/book.entity';
import { Fine } from './fine.entity';

export enum BorrowingStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost',
}

@Entity('borrowings')
export class Borrowing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @ManyToOne(() => Book, { eager: true })
  book: Book;

  @Column({ type: 'timestamp' })
  borrowDate: Date;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  returnDate: Date;

  @Column({
    type: 'enum',
    enum: BorrowingStatus,
    default: BorrowingStatus.ACTIVE,
  })
  status: BorrowingStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'int', default: 0 })
  renewCount: number;

  @Column({ type: 'int', default: 3 })
  maxRenewals: number;

  @Column({ nullable: true })
  digitalSignature: string;

  @OneToOne(() => Fine, (fine) => fine.borrowing, { nullable: true })
  fine: Fine;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
