import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateMealLogDto } from './dto/create-meal-log.dto';
import { NutritionService } from './nutrition.service';

@ApiTags('Nutrition')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('nutrition')
export class NutritionController {
	constructor(private readonly nutritionService: NutritionService) {}

	@Get('analyze')
	@ApiOperation({ summary: 'Analyze food query for nutrition data' })
	@ApiResponse({ status: 200, description: 'Returns nutrition data.' })
	async analyze(@Query('query') query: string) {
		return this.nutritionService.fetchNutritionData(query);
	}

	@Post('log-meal')
	@ApiOperation({ summary: 'Log a meal from natural language query' })
	@ApiResponse({ status: 201, description: 'Meal logged successfully.' })
	async logMeal(@Req() req, @Body() dto: CreateMealLogDto) {
		return this.nutritionService.logMeal(
			req.user.id,
			dto.query,
			dto.emotionalState || 'NEUTRAL',
			dto.eatingContext || 'HOME',
		);
	}
}
