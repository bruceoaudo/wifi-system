import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: { email: string; password: string, mac: string, ip: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token } = await this.authService.login(
      body.email,
      body.password,
      body.ip,
      body.mac,
    );

    // Set the access token in an HTTP-only cookie
    res.cookie('access_token', access_token, {
      httpOnly: true, // prevents JS access (more secure)
      secure: false, // true in production with HTTPS
      sameSite: 'lax', // adjust for cross-site
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    return { message: 'Login successful' };
  }
}
