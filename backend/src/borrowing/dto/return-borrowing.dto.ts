import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ReturnBorrowingDto {
  @ApiProperty({ example: 'Book in good condition', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
