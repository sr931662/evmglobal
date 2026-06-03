import { Controller, Post, Get, Patch, Body, UseGuards, Request, Req, Res, HttpCode, UnauthorizedException } from '@nestjs/common';
import type { Request as ExpressRequest, Response } from 'express';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerJwtAuthGuard } from './customer-auth.guard';
import { QuotesService } from '../quotes/quotes.service';

const isProd = () => process.env.NODE_ENV === 'production';

const rtCookieOpts = () => ({
  httpOnly: true,
  secure: isProd(),
  sameSite: (isProd() ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

@Controller('customer-auth')
export class CustomerAuthController {
  constructor(
    private customerAuthService: CustomerAuthService,
    private quotesService: QuotesService,
  ) {}

  @Post('register')
  async register(
    @Body() body: { name: string; email: string; password: string; phone?: string; city?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.customerAuthService.register(body);
    res.cookie('emv_c_rt', data.refresh_token, rtCookieOpts());
    return { customer: data.customer, access_token: data.access_token, token_type: data.token_type, expires_in: data.expires_in };
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.customerAuthService.login(body.email, body.password);
    res.cookie('emv_c_rt', data.refresh_token, rtCookieOpts());
    return { customer: data.customer, access_token: data.access_token, token_type: data.token_type, expires_in: data.expires_in };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req as any).cookies?.emv_c_rt;
    if (!refreshToken) throw new UnauthorizedException('No refresh token');
    const data = await this.customerAuthService.refreshAccessToken(refreshToken);
    res.cookie('emv_c_rt', data.refresh_token, rtCookieOpts());
    return { access_token: data.access_token, token_type: data.token_type, expires_in: data.expires_in };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('emv_c_rt', { path: '/' });
    return { message: 'Logged out' };
  }

  @Get('profile')
  @UseGuards(CustomerJwtAuthGuard)
  getProfile(@Request() req: any) {
    return this.customerAuthService.getProfile(req.user.id);
  }

  @Patch('profile')
  @UseGuards(CustomerJwtAuthGuard)
  updateProfile(@Request() req: any, @Body() body: { name?: string; phone?: string; city?: string }) {
    return this.customerAuthService.updateProfile(req.user.id, body);
  }

  @Patch('change-password')
  @UseGuards(CustomerJwtAuthGuard)
  @HttpCode(200)
  changePassword(@Request() req: any, @Body() body: { oldPassword: string; newPassword: string }) {
    return this.customerAuthService.changePassword(req.user.id, body.oldPassword, body.newPassword);
  }

  @Get('my-trips')
  @UseGuards(CustomerJwtAuthGuard)
  getMyTrips(@Request() req: any) {
    return this.quotesService.findByEmail(req.user.email);
  }

  @Post('forgot-password')
  @HttpCode(200)
  forgotPassword(@Body() body: { email: string }) {
    return this.customerAuthService.sendPasswordResetOtp(body.email);
  }

  @Post('verify-otp')
  @HttpCode(200)
  verifyOtp(@Body() body: { email: string; otp: string }) {
    return this.customerAuthService.verifyOtp(body.email, body.otp);
  }

  @Post('reset-password')
  @HttpCode(200)
  resetPassword(@Body() body: { resetToken: string; newPassword: string }) {
    return this.customerAuthService.resetPassword(body.resetToken, body.newPassword);
  }
}
