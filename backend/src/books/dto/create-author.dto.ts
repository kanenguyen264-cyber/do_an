import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({ example: 'Robert C. Martin' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'American software engineer and author', required: false })
  @IsString()
  @IsOptional()
  biography?: string;

  @ApiProperty({ example: '1952-12-05', required: false })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiProperty({ example: 'American', required: false })
  @IsString()
  @IsOptional()
  nationality?: string;
}
