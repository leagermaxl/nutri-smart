import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { EditUserDto } from './dto/edit-user.dto';
import { UserService } from './user.service';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
	constructor(private userService: UserService) {}

	@Get('me')
	@ApiOperation({ summary: 'Get current user profile' })
	@ApiResponse({ status: 200, description: 'Return current user profile.' })
	getMe(@Req() req) {
		return this.userService.getMe(req.user.id);
	}

	@Patch('me')
	@ApiOperation({ summary: 'Update current user profile' })
	@ApiResponse({ status: 200, description: 'User profile updated.' })
	editUser(@Req() req, @Body() dto: EditUserDto) {
		return this.userService.editUser(req.user.id, dto);
	}
}
