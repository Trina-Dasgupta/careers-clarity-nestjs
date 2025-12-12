import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  @ApiProperty({ example: 'P@ssw0rd!', minLength: 8 })
  password: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, example: 'Jane' })
  firstName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, example: 'Doe' })
  lastName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, example: '+1234567890' })
  phone?: string;

  @IsOptional()
  @IsString()
  name?: string;
}

