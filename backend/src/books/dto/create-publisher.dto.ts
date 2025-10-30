import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreatePublisherDto {
  @ApiProperty({ example: 'Prentice Hall' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '123 Publisher St, New York', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '+1-234-567-8900', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'contact@prenticehall.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'https://www.prenticehall.com', required: false })
  @IsString()
  @IsOptional()
  website?: string;
}
