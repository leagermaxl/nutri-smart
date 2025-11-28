import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateFoodLogDto } from './dto/create-food-log.dto';
import { FoodDiaryService } from './food-diary.service';

@ApiTags('Food Diary')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('food-logs')
export class FoodDiaryController {
	constructor(private readonly foodDiaryService: FoodDiaryService) {}

	@Post()
	@ApiOperation({ summary: 'Log a new food entry' })
	@ApiResponse({ status: 201, description: 'The food log has been successfully created.' })
	async createLog(@Req() req, @Body() createFoodLogDto: CreateFoodLogDto) {
		return this.foodDiaryService.createLog(req.user.id, createFoodLogDto);
	}

	@Get()
	@ApiOperation({ summary: 'Get food logs for a specific date' })
	@ApiQuery({
		name: 'date',
		required: false,
		description: 'Date in YYYY-MM-DD format (defaults to today)',
	})
	@ApiResponse({ status: 200, description: 'Return all food logs for the specified date.' })
	async getLogsByDate(@Req() req, @Query('date') dateStr?: string) {
		const date = dateStr ? new Date(dateStr) : new Date();
		return this.foodDiaryService.getDailyLogs(req.user.id, date);
	}

	@Get('today')
	@ApiOperation({ summary: 'Get food logs for today' })
	@ApiResponse({ status: 200, description: 'Return all food logs for the current day.' })
	async getDailyLogs(@Req() req) {
		return this.foodDiaryService.getDailyLogs(req.user.id, new Date());
	}
}
