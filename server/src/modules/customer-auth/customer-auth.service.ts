import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { CustomersService } from '../customers/customers.service';
import { EmailService } from '../email/email.service';

interface OtpEntry {
  otp: string;
  expiresAt: number;
  used: boolean;
  requestedAt: number;
}

@Injectable()
export class CustomerAuthService {
  private logger = new Logger('CustomerAuthService');
  private otpStore = new Map<string, OtpEntry>();

  constructor(
    private customersService: CustomersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  private issueTokens(customer: any) {
    const id = customer._id?.toString() || customer.id;
    const payload = { sub: id, email: customer.email, type: 'customer' };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_REFRESH_EXPIRY || '7d') as any,
    });
    return { access_token, refresh_token, token_type: 'Bearer', expires_in: process.env.JWT_EXPIRY || '1h' };
  }

  async register(data: { name: string; email: string; password: string; phone?: string; city?: string }) {
    const existing = await this.customersService.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists. Please log in instead.');
    }
    const customer = await this.customersService.create(data);
    this.logger.log(`New customer registered: ${data.email}`);
    try {
      await this.emailService.sendCustomerWelcomeEmail(data.email, data.name);
    } catch (err) {
      this.logger.warn(`Welcome email failed for ${data.email}: ${err.message}`);
    }
    return { customer, ...this.issueTokens(customer) };
  }

  async login(email: string, password: string) {
    const customer = await this.customersService.findByEmail(email, true);
    if (!customer) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!customer.password) {
      throw new UnauthorizedException('This account was created without a password. Please use "Forgot Password" to set one.');
    }
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }
    await this.customersService.updateProfile(customer._id?.toString() || customer.id, {});
    const { password: _, ...safeCustomer } = customer;
    return { customer: safeCustomer, ...this.issueTokens(customer) };
  }

  async refreshAccessToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      if (payload.type !== 'customer') throw new UnauthorizedException('Invalid token type');
      const customer = await this.customersService.findById(payload.sub);
      if (!customer) throw new UnauthorizedException('Customer not found');
      return this.issueTokens(customer);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getProfile(customerId: string) {
    const customer = await this.customersService.findById(customerId);
    if (!customer) throw new UnauthorizedException('Customer not found');
    return customer;
  }

  async updateProfile(customerId: string, data: { name?: string; phone?: string; city?: string }) {
    return this.customersService.updateProfile(customerId, data);
  }

  async changePassword(customerId: string, oldPassword: string, newPassword: string) {
    const customer = await this.customersService.findById(customerId, true);
    if (!customer) throw new UnauthorizedException('Customer not found');

    if (!customer.password) {
      throw new BadRequestException('No password set on this account. Use "Forgot Password" to set one.');
    }
    const isMatch = await bcrypt.compare(oldPassword, customer.password);
    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    await this.customersService.updatePassword(customerId, newPassword);
    return { message: 'Password changed successfully.' };
  }

  async sendPasswordResetOtp(email: string) {
    const key = email.toLowerCase();
    const customer = await this.customersService.findByEmail(key);
    if (!customer) {
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
      await this.emailService.sendCustomerOtpEmail(key, otp, customer.name);
    } catch (err) {
      this.otpStore.delete(key);
      throw new BadRequestException('Failed to send OTP. Please try again.');
    }

    return { message: 'If that email is registered, an OTP has been sent.' };
  }

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

    entry.used = true;
    this.otpStore.set(key, entry);

    const resetToken = this.jwtService.sign(
      { sub: key, purpose: 'customer_password_reset' },
      { expiresIn: '15m' as any },
    );
    return { resetToken };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(resetToken, { secret: process.env.JWT_SECRET });
    } catch {
      throw new BadRequestException('Reset token is invalid or has expired.');
    }

    if (payload.purpose !== 'customer_password_reset') {
      throw new BadRequestException('Invalid reset token.');
    }

    const customer = await this.customersService.findByEmail(payload.sub);
    if (!customer) throw new BadRequestException('Customer not found.');

    await this.customersService.updatePassword(customer._id?.toString() || customer.id, newPassword);
    this.otpStore.delete(payload.sub);
    return { message: 'Password reset successfully. You may now log in.' };
  }
}
