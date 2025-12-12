import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '2525', 10),
      secure: process.env.MAIL_ENCRYPTION === 'tls', // Use TLS if specified
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  /**
   * Send email with custom template
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param html - HTML content of email
   * @param text - Plain text content (optional)
   */
  async sendMail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Fallback: strip HTML tags for plain text
      });
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send forgot password email with reset link
   * @param email - User email
   * @param resetToken - Password reset token
   * @param resetLink - Full reset link URL
   */
  async sendForgotPasswordEmail(
    email: string,
    resetToken: string,
    resetLink: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the link below to reset it:</p>
        <p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetLink}</p>
        <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request a password reset, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} ${process.env.MAIL_FROM_NAME}. All rights reserved.</p>
      </div>
    `;

    await this.sendMail(email, 'Password Reset Request', html);
  }

  /**
   * Send password reset confirmation email
   * @param email - User email
   */
  async sendPasswordResetConfirmation(email: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Successful</h2>
        <p>Hello,</p>
        <p>Your password has been successfully reset.</p>
        <p>If you didn't make this change, please contact our support team immediately.</p>
        <p style="margin-top: 30px;">
          <strong>Best regards,</strong><br>
          ${process.env.MAIL_FROM_NAME} Team
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} ${process.env.MAIL_FROM_NAME}. All rights reserved.</p>
      </div>
    `;

    await this.sendMail(email, 'Password Reset Successful', html);
  }

  /**
   * Send account verification email
   * @param email - User email
   * @param verificationLink - Email verification link
   */
  async sendVerificationEmail(
    email: string,
    verificationLink: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify Your Email Address</h2>
        <p>Hello,</p>
        <p>Thank you for signing up! Please verify your email address by clicking the link below:</p>
        <p>
          <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationLink}</p>
        <p style="color: #999; font-size: 12px;">This link will expire in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} ${process.env.MAIL_FROM_NAME}. All rights reserved.</p>
      </div>
    `;

    await this.sendMail(email, 'Verify Your Email Address', html);
  }

  /**
   * Send account welcome email
   * @param email - User email
   * @param userName - User name
   */
  async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to ${process.env.MAIL_FROM_NAME}!</h2>
        <p>Hi ${userName},</p>
        <p>Your account has been successfully created. We're excited to have you on board!</p>
        <p>You can now log in and start using our services.</p>
        <p style="margin-top: 30px;">
          <strong>Best regards,</strong><br>
          ${process.env.MAIL_FROM_NAME} Team
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} ${process.env.MAIL_FROM_NAME}. All rights reserved.</p>
      </div>
    `;

    await this.sendMail(email, 'Welcome to ' + process.env.MAIL_FROM_NAME, html);
  }

  /**
   * Send email verification OTP
   * @param email - User email
   * @param otp - One-time password (6 digits)
   */
  async sendVerificationOTP(email: string, otp: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Hello,</p>
        <p>Your one-time password (OTP) for email verification is:</p>
        <p style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; text-align: center; margin: 20px 0;">
          ${otp}
        </p>
        <p style="color: #999; font-size: 14px;">This OTP will expire in 10 minutes.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} ${process.env.MAIL_FROM_NAME}. All rights reserved.</p>
      </div>
    `;

    await this.sendMail(email, 'Email Verification OTP', html);
  }
}
    `;

    await this.sendMail(email, `Welcome to ${process.env.MAIL_FROM_NAME}!`, html);
  }
}
