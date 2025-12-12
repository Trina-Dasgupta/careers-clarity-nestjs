import { IsEmail, IsString, IsLength } from 'class-validator';

export class VerifyEmailOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsLength(6, 6)
  otp: string;
}
