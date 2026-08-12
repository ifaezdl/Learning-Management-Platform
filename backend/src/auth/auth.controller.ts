import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
  })
  @ApiResponse({
    status: 409,
    description: 'Email or Username already exists.',
  })
  register(@Body() RegisterDto: RegisterDto) {
    return this.authService.register(RegisterDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with username and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns access and refresh tokens.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or inactive account.',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token using a valid refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid, revoked, or expired refresh token.',
  })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Logout and revoke the refresh token',
  })
  @ApiBody({ type: LogoutDto })
  @ApiResponse({
    status: 200,
    description: 'Logout successful.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or already revoked refresh token.',
  })
  logout(@Body() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto);
  }

  // ============================
  // Google OAuth
  // ============================

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() { }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    try {
      const result = await this.authService.loginWithGoogle(req.user);

      return res.redirect(
        `${frontendUrl}/google-callback?token=${encodeURIComponent(
          result.accessToken,
        )}&refreshToken=${encodeURIComponent(result.refreshToken)}`,
      );
    } catch (error) {
      console.error('Google OAuth callback error:', error);

      const errorMessage =
        error?.response?.message || error?.message || 'خطا در ورود با گوگل';

      // در حالت خطا برگرد به صفحه‌ی لاگین، نه google-callback
      return res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(errorMessage)}`,
      );
    }
  }
}