import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Science Fiction' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Books about science and future', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'science-fiction', required: false })
  @IsString()
  @IsOptional()
  slug?: string;
}
