import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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
}