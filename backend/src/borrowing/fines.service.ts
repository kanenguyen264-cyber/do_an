import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fine, FineStatus } from './entities/fine.entity';

@Injectable()
export class FinesService {
  constructor(
    @InjectRepository(Fine)
    private fineRepository: Repository<Fine>,
  ) {}

  async findAll(filters?: {
    userId?: string;
    status?: FineStatus;
  }): Promise<Fine[]> {
    const queryBuilder = this.fineRepository
      .createQueryBuilder('fine')
      .leftJoinAndSelect('fine.user', 'user')
      .leftJoinAndSelect('fine.borrowing', 'borrowing')
      .leftJoinAndSelect('borrowing.book', 'book');

    if (filters?.userId) {
      queryBuilder.andWhere('fine.userId = :userId', { userId: filters.userId });
    }

    if (filters?.status) {
      queryBuilder.andWhere('fine.status = :status', { status: filters.status });
    }

    return queryBuilder.orderBy('fine.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Fine> {
    const fine = await this.fineRepository.findOne({
      where: { id },
      relations: ['user', 'borrowing', 'borrowing.book'],
    });

    if (!fine) {
      throw new NotFoundException(`Fine with ID ${id} not found`);
    }

    return fine;
  }

  async payFine(id: string): Promise<Fine> {
    const fine = await this.findOne(id);

    if (fine.status !== FineStatus.PENDING) {
      throw new NotFoundException('Fine is not pending');
    }

    fine.status = FineStatus.PAID;
    fine.paidDate = new Date();

    return this.fineRepository.save(fine);
  }

  async waiveFine(id: string, notes?: string): Promise<Fine> {
    const fine = await this.findOne(id);

    if (fine.status !== FineStatus.PENDING) {
      throw new NotFoundException('Fine is not pending');
    }

    fine.status = FineStatus.WAIVED;
    if (notes) {
      fine.notes = notes;
    }

    return this.fineRepository.save(fine);
  }

  async getUserFines(userId: string): Promise<Fine[]> {
    return this.fineRepository.find({
      where: { user: { id: userId } },
      relations: ['borrowing', 'borrowing.book'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTotalUnpaidFines(userId: string): Promise<number> {
    const result = await this.fineRepository
      .createQueryBuilder('fine')
      .select('SUM(fine.amount)', 'total')
      .where('fine.userId = :userId', { userId })
      .andWhere('fine.status = :status', { status: FineStatus.PENDING })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }
}
