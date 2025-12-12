import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  UseGuards,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyEmailOtpDto } from './dto/verify-email-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { GetUser } from './decorators/get-user.decorator';

@ApiTags('Auth')
@ApiBearerAuth('access-token')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);

    // Set JWT cookie (7 days)
    try {
      res.cookie('jwt', result.accessToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
    } catch (err) {
      // If cookie can't be set, still return token in response body
      console.error('Failed to set cookie:', err);
    }

    return {
      success: true,
      message: 'User Logged in successfully',
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@GetUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(userId, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile')
  @HttpCode(HttpStatus.OK)
  async deleteProfile(@GetUser('id') userId: string) {
    return this.authService.deleteProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @GetUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@GetUser() user: any) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('check')
  @ApiOperation({ summary: 'Check authentication (returns current user)' })
  async check(@Req() req: Request, @Res() res: Response) {
    try {
      return res.status(200).json({
        success: true,
        message: 'User authenticated successfully',
        user: (req as any).user,
      });
    } catch (error) {
      console.error('Error checking user:', error);
      return res.status(500).json({ error: 'Error checking user' });
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user (clears jwt cookie)' })
  async logout(@Res() res: Response) {
    try {
      res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV !== 'development',
      });

      return res.status(200).json({
        success: true,
        message: 'User logged out successfully',
      });
    } catch (error) {
      console.error('Error logging out user:', error);
      return res.status(500).json({ error: 'Error logging out user' });
    }
  }

  @Public()
  @Post('send-verification-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to email for verification' })
  @ApiBody({
    type: SendOtpDto,
    schema: {
      example: { email: 'user@example.com' },
    },
  })
  async sendVerificationOTP(@Body() body: SendOtpDto) {
    return this.authService.sendVerificationOTP(body.email);
  }

  @Public()
  @Post('verify-email-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with OTP' })
  @ApiBody({
    type: VerifyEmailOtpDto,
    schema: {
      example: { email: 'user@example.com', otp: '123456' },
    },
  })
  async verifyEmailOTP(@Body() body: VerifyEmailOtpDto) {
    return this.authService.verifyEmailWithOTP(body.email, body.otp);
  }
}