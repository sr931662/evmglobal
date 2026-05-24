import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  UsePipes,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JoiValidationPipe } from '../../common/pipes/validation.pipe';
import { loginSchema } from './dto/login.dto';
import { refreshTokenSchema } from './dto/refresh-token.dto';
import { forgotPasswordSchema } from './dto/forgot-password.dto';
import { verifyOtpSchema } from './dto/verify-otp.dto';
import { resetPasswordSchema } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';

@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');

  constructor(private authService: AuthService) {}

  /**
   * Authenticate user with email and password.
   * Returns access token.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new JoiValidationPipe(loginSchema))
  async login(@Body() body) {
    const { email, password } = body;
    const user = await this.authService.validateUser(email, password);
    const tokens = await this.authService.login(user);
    this.logger.log(`User ${user.email} logged in successfully`);
    return tokens;
  }

  /**
   * Refresh an expired access token using a valid refresh token.
   * (Optional – can be added later if you implement refresh token logic)
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new JoiValidationPipe(refreshTokenSchema))
  async refreshToken(@Body() body) {
    const { refreshToken } = body;
    const tokens = await this.authService.refreshAccessToken(refreshToken);
    this.logger.log('Token refreshed successfully');
    return tokens;
  }

  /**
   * Get current logged-in user profile.
   */
  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getProfile(@Req() req) {
    return {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    };
  }

  /** Step 1 — send OTP to email */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new JoiValidationPipe(forgotPasswordSchema))
  async forgotPassword(@Body() body) {
    return this.authService.sendPasswordResetOtp(body.email);
  }

  /** Step 2 — verify OTP, receive reset token */
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new JoiValidationPipe(verifyOtpSchema))
  verifyOtp(@Body() body) {
    return this.authService.verifyOtp(body.email, body.otp);
  }

  /** Step 3 — set new password using reset token */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new JoiValidationPipe(resetPasswordSchema))
  async resetPassword(@Body() body) {
    return this.authService.resetPassword(body.resetToken, body.newPassword);
  }
}