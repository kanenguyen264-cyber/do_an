import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsArray, IsUUID, Min } from 'class-validator';
import { BookStatus } from '../entities/book.entity';

export class CreateBookDto {
  @ApiProperty({ example: 'Clean Code' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '978-0132350884' })
  @IsString()
  @IsNotEmpty()
  isbn: string;

  @ApiProperty({ example: 'A handbook of agile software craftsmanship', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://example.com/cover.jpg', required: false })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiProperty({ example: 2008 })
  @IsNumber()
  @IsOptional()
  publishYear?: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  totalCopies: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  availableCopies?: number;

  @ApiProperty({ example: 450000 })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ example: 464 })
  @IsNumber()
  @IsOptional()
  pageCount?: number;

  @ApiProperty({ example: 'English' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({ enum: BookStatus, default: BookStatus.AVAILABLE })
  @IsEnum(BookStatus)
  @IsOptional()
  status?: BookStatus;

  @ApiProperty({ example: 'uuid-of-category' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: ['uuid-of-author-1', 'uuid-of-author-2'], type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  authorIds: string[];

  @ApiProperty({ example: 'uuid-of-publisher' })
  @IsUUID()
  @IsNotEmpty()
  publisherId: string;
}
