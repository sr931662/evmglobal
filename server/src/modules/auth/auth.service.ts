import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

interface OtpEntry {
  otp: string;
  expiresAt: number;
  used: boolean;
  requestedAt: number;
}

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');
  // In-memory OTP store keyed by lowercase email
  private otpStore = new Map<string, OtpEntry>();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  /**
   * Validates user credentials.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} user object without password
   */
  async validateUser(email, password) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      this.logger.warn(`Login attempt for non-existent email: ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      this.logger.warn(`Failed password attempt for user: ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }
    // Remove sensitive fields before returning
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * Generates access token (and optional refresh token).
   * @param {Object} user - User object (must contain id, email, role)
   * @returns {Promise<{access_token: string, refresh_token?: string}>}
   */
  async login(user) {
    const id = user._id?.toString() || user.id;
    const payload = { sub: id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    // Optional: generate a refresh token (longer-lived)
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_REFRESH_EXPIRY || '7d') as any,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: process.env.JWT_EXPIRY || '1h',
    };
  }

  /**
   * Refreshes the access token using a valid refresh token.
   * Validates the refresh token and issues a new access token.
   * @param {string} token - The refresh token
   * @returns {Promise<{access_token: string, refresh_token: string}>}
   */
  async refreshAccessToken(token) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
        ignoreExpiration: false,
      });
      // Verify user still exists
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      // Issue new tokens (rotation)
      return this.login({ _id: user._id, email: user.email, role: user.role });
    } catch (error) {
      this.logger.warn(`Invalid refresh token: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /** Sends a 6-digit OTP to the given email. Rate-limited to 1 request per 2 minutes. */
  async sendPasswordResetOtp(email: string) {
    const key = email.toLowerCase();
    const user = await this.usersService.findByEmail(key);
    // Always return success to prevent email enumeration
    if (!user) {
      this.logger.warn(`Password reset requested for unknown email: ${key}`);
      return { message: 'If that email is registered, an OTP has been sent.' };
    }

    const existing = this.otpStore.get(key);
    const now = Date.now();
    if (existing && now - existing.requestedAt < 2 * 60 * 1000) {
      throw new BadRequestException('Please wait 2 minutes before requesting another OTP.');
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    this.otpStore.set(key, { otp, expiresAt: now + 10 * 60 * 1000, used: false, requestedAt: now });

    try {
      await this.emailService.sendOtpEmail(key, otp);
    } catch (err) {
      this.otpStore.delete(key);
      this.logger.error(`Failed to send OTP to ${key}: ${err.message}`);
      throw new BadRequestException('Failed to send OTP. Please try again.');
    }

    return { message: 'If that email is registered, an OTP has been sent.' };
  }

  /** Verifies OTP and returns a short-lived reset token on success. */
  verifyOtp(email: string, otp: string): { resetToken: string } {
    const key = email.toLowerCase();
    const entry = this.otpStore.get(key);
    const now = Date.now();

    if (!entry || entry.used || now > entry.expiresAt) {
      throw new BadRequestException('OTP is invalid or has expired. Please request a new one.');
    }
    if (entry.otp !== otp) {
      throw new BadRequestException('Incorrect OTP. Please try again.');
    }

    // Mark as used so it can't be replayed
    entry.used = true;
    this.otpStore.set(key, entry);

    // Issue a short-lived reset token (15 min)
    const resetToken = this.jwtService.sign(
      { sub: key, purpose: 'password_reset' },
      { expiresIn: '15m' as any },
    );
    return { resetToken };
  }

  /** Resets the password using the reset token issued after OTP verification. */
  async resetPassword(resetToken: string, newPassword: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(resetToken, {
        secret: process.env.JWT_SECRET,
        ignoreExpiration: false,
      });
    } catch {
      throw new BadRequestException('Reset token is invalid or has expired. Please restart the process.');
    }

    if (payload.purpose !== 'password_reset') {
      throw new BadRequestException('Invalid reset token.');
    }

    const user = await this.usersService.findByEmail(payload.sub);
    if (!user) throw new BadRequestException('User not found.');

    await this.usersService.updatePassword(user._id.toString(), newPassword);
    this.otpStore.delete(payload.sub);
    this.logger.log(`Password reset successfully for: ${payload.sub}`);
    return { message: 'Password reset successfully. You may now log in.' };
  }
}