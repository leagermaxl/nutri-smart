import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('register')
	@ApiOperation({ summary: 'Register a new user' })
	@ApiResponse({ status: 201, description: 'User successfully registered.' })
	async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
		const { access_token } = await this.authService.register(dto);
		this.setCookie(res, access_token);
		return { message: 'Registered successfully' };
	}

	@Post('login')
	@ApiOperation({ summary: 'Login user' })
	@ApiResponse({ status: 200, description: 'User successfully logged in.' })
	async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
		const { access_token } = await this.authService.login(dto);
		this.setCookie(res, access_token);
		return { message: 'Logged in successfully' };
	}

	private setCookie(res: Response, token: string) {
		res.cookie('Authentication', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 15 * 60 * 1000, // 15 minutes
		});
	}
}
