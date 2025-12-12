import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    const { email, password, firstName, lastName, phone } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Validate password strength
    this.validatePasswordStrength(password);

    // Hash password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const name = [firstName, lastName].filter(Boolean).join(' ').trim() || null;

      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          firstName,
          lastName,
          phone,
          isActive: true,
          isEmailVerified: false,
        },
      });

      // Generate JWT token
      const token = this.generateToken(user);

      // Return user and token (exclude password)
      const userResponse = this.excludePassword(user);
      return {
        user: userResponse,
        accessToken: token,
      };
    } catch (error) {
      throw new BadRequestException('Failed to create user');
    }
  }

  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Return user and token (exclude password)
    const userResponse = this.excludePassword(user);
    return {
      user: userResponse,
      accessToken: token,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user as User;
  }

  async validateJwtUser(payload: any): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user || !user.isActive) {
      return null;
    }

    return user as User;
  }

  async forgotPassword(email: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Return success message even if user not found for security
      return {
        message:
          'If this email exists, a password reset link has been sent',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to database
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: resetTokenExpires,
      },
    });

    // Send password reset email
    try {
      const resetLink = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      await this.mailService.sendForgotPasswordEmail(
        user.email,
        resetToken,
        resetLink,
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Don't throw error to avoid exposing mail service issues
    }

    return {
      message: 'If this email exists, a password reset link has been sent',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
    const { token, password } = resetPasswordDto;

    // Validate password strength
    this.validatePasswordStrength(password);

    // Find user with matching reset token
    const users = await this.prisma.user.findMany();
    let foundUser: User | null = null;

    for (const user of users) {
      if (
        user.resetPasswordToken &&
        (await bcrypt.compare(token, user.resetPasswordToken))
      ) {
        // Check if token is expired
        if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
          throw new BadRequestException('Password reset token has expired');
        }
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      throw new BadRequestException('Invalid reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    await this.prisma.user.update({
      where: { id: foundUser.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    // Send password reset confirmation email
    try {
      await this.mailService.sendPasswordResetConfirmation(foundUser.email);
    } catch (error) {
      console.error('Failed to send password reset confirmation email:', error);
      // Don't throw error - password reset is already done
    }

    return {
      message: 'Password reset successfully',
    };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<any> {
    const { currentPassword, newPassword } = changePasswordDto;

    // Find user
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Validate new password strength
    this.validatePasswordStrength(newPassword);

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      throw new BadRequestException(
        'New password cannot be same as current password',
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return {
      message: 'Password changed successfully',
      user: this.excludePassword(updatedUser),
    };
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.excludePassword(user);
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<any> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateProfileDto,
      });

      return {
        message: 'Profile updated successfully',
        user: this.excludePassword(updatedUser),
      };
    } catch (error) {
      throw new BadRequestException('Failed to update profile');
    }
  }

  async deleteProfile(userId: string): Promise<any> {
    try {
      await this.prisma.user.delete({
        where: { id: userId },
      });

      return {
        message: 'Account deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException('Failed to delete account');
    }
  }

  // Helper methods
  private generateToken(user: User): string {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  private excludePassword(user: User & Record<string, any>): any {
    const { password, resetPasswordToken, emailVerificationToken, ...userWithoutSensitiveData } = user as any;
    return userWithoutSensitiveData;
  }

  private validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      throw new BadRequestException(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      );
    }
  }

  // Generate a 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP to email for verification
  async sendVerificationOTP(email: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // For security, return same message as if email exists
      return {
        success: true,
        message: 'If this email is registered, an OTP has been sent',
      };
    }

    // If already verified, return error
    if (user.isEmailVerified) {
      return {
        success: true,
        message: 'Email is already verified',
      };
    }

    // Generate OTP (6 digits)
    const otp = this.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationOTP: otp,
        emailVerificationOTPExpires: otpExpires,
      },
    });

    // Send OTP via email
    try {
      await this.mailService.sendVerificationOTP(email, otp);
    } catch (err) {
      console.error('Failed to send verification OTP email:', err);
      // Still return success to avoid revealing if email exists
    }

    return {
      success: true,
      message: 'If this email is registered, an OTP has been sent',
    };
  }

  // Verify OTP and mark email as verified
  async verifyEmailWithOTP(email: string, otp: string): Promise<any> {
  const user = await this.prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  if (user.isEmailVerified) {
    return {
      success: true,
      message: 'Email is already verified',
    };
  }

  // Check if OTP exists and is not expired
  if (!user.emailVerificationOTP) {
    throw new BadRequestException('No OTP request found. Please request a new OTP.');
  }

  // Fixed: Check for null before comparing dates
  if (!user.emailVerificationOTPExpires || new Date() > user.emailVerificationOTPExpires) {
    throw new BadRequestException('OTP has expired. Please request a new one.');
  }

  // Verify OTP
  if (user.emailVerificationOTP !== otp) {
    throw new UnauthorizedException('Invalid OTP');
  }

  // Mark email as verified and clear OTP
  const updatedUser = await this.prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerificationOTP: null,
      emailVerificationOTPExpires: null,
    },
  });

  return {
    success: true,
    message: 'Email verified successfully',
    user: this.excludePassword(updatedUser),
  };
}
}
