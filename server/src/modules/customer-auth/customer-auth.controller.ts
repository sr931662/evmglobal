import { Controller, Post, Get, Patch, Body, UseGuards, Request, HttpCode } from '@nestjs/common';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerJwtAuthGuard } from './customer-auth.guard';
import { QuotesService } from '../quotes/quotes.service';

@Controller('customer-auth')
export class CustomerAuthController {
  constructor(
    private customerAuthService: CustomerAuthService,
    private quotesService: QuotesService,
  ) {}

  @Post('register')
  register(@Body() body: { name: string; email: string; password: string; phone?: string; city?: string }) {
    return this.customerAuthService.register(body);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() body: { email: string; password: string }) {
    return this.customerAuthService.login(body.email, body.password);
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() body: { refreshToken: string }) {
    return this.customerAuthService.refreshAccessToken(body.refreshToken);
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
