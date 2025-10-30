import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publisher } from './entities/publisher.entity';
import { CreatePublisherDto } from './dto/create-publisher.dto';

@Injectable()
export class PublishersService {
  constructor(
    @InjectRepository(Publisher)
    private publishersRepository: Repository<Publisher>,
  ) {}

  async create(createPublisherDto: CreatePublisherDto): Promise<Publisher> {
    const publisher = this.publishersRepository.create(createPublisherDto);
    return this.publishersRepository.save(publisher);
  }

  async findAll(): Promise<Publisher[]> {
    return this.publishersRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Publisher> {
    const publisher = await this.publishersRepository.findOne({
      where: { id },
      relations: ['books'],
    });

    if (!publisher) {
      throw new NotFoundException(`Publisher with ID ${id} not found`);
    }

    return publisher;
  }

  async update(id: string, updatePublisherDto: CreatePublisherDto): Promise<Publisher> {
    const publisher = await this.findOne(id);
    Object.assign(publisher, updatePublisherDto);
    return this.publishersRepository.save(publisher);
  }

  async remove(id: string): Promise<void> {
    const publisher = await this.findOne(id);
    await this.publishersRepository.remove(publisher);
  }
}
