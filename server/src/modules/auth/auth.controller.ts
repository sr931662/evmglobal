import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UsePipes,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JoiValidationPipe } from '../../common/pipes/validation.pipe';
import { loginSchema } from './dto/login.dto';
import { forgotPasswordSchema } from './dto/forgot-password.dto';
import { verifyOtpSchema } from './dto/verify-otp.dto';
import { resetPasswordSchema } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';

const isProd = () => process.env.NODE_ENV === 'production';

const rtCookieOpts = (rememberMe = true) => ({
  httpOnly: true,
  secure: isProd(),
  sameSite: (isProd() ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
  ...(rememberMe ? { maxAge: 7 * 24 * 60 * 60 * 1000 } : {}),
});

@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');

  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new JoiValidationPipe(loginSchema))
  async login(
    @Body() body,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(body.email, body.password);
    const tokens = await this.authService.login(user);
    res.cookie('emv_rt', tokens.refresh_token, rtCookieOpts(body.rememberMe !== false));
    this.logger.log(`User ${user.email} logged in`);
    return { access_token: tokens.access_token, token_type: tokens.token_type, expires_in: tokens.expires_in };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req as any).cookies?.emv_rt;
    if (!refreshToken) throw new UnauthorizedException('No refresh token');
    const tokens = await this.authService.refreshAccessToken(refreshToken);
    res.cookie('emv_rt', tokens.refresh_token, rtCookieOpts());
    this.logger.log('Token refreshed');
    return { access_token: tokens.access_token, token_type: tokens.token_type, expires_in: tokens.expires_in };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('emv_rt', { path: '/' });
    return { message: 'Logged out' };
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getProfile(@Req() req) {
    return { id: req.user.id, email: req.user.email, role: req.user.role };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new JoiValidationPipe(forgotPasswordSchema))
  async forgotPassword(@Body() body) {
    return this.authService.sendPasswordResetOtp(body.email);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new JoiValidationPipe(verifyOtpSchema))
  verifyOtp(@Body() body) {
    return this.authService.verifyOtp(body.email, body.otp);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new JoiValidationPipe(resetPasswordSchema))
  async resetPassword(@Body() body) {
    return this.authService.resetPassword(body.resetToken, body.newPassword);
  }
}
