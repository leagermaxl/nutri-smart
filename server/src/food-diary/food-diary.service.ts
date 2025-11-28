import { Injectable } from '@nestjs/common';

import { NutritionService } from '../nutrition/nutrition.service';
import { PrismaService } from '../prisma/prisma.service';

import { CreateFoodLogDto } from './dto/create-food-log.dto';

@Injectable()
export class FoodDiaryService {
	constructor(
		private prisma: PrismaService,
		private nutritionService: NutritionService,
	) {}

	async createLog(userId: string, dto: CreateFoodLogDto) {
		let {
			calories,
			servingSize,
			protein,
			fatTotal,
			fatSaturated,
			carbohydratesTotal,
			fiber,
			sugar,
			sodium,
			potassium,
			cholesterol,
		} = dto;

		// Auto-fill macros if missing (checking if calories is missing as a primary indicator)
		if (calories === undefined) {
			const nutrition = await this.nutritionService.fetchNutritionData(dto.foodName, userId);
			calories = calories ?? nutrition.calories;
			servingSize = servingSize ?? nutrition.servingSize;
			protein = protein ?? nutrition.protein;
			fatTotal = fatTotal ?? nutrition.fatTotal;
			fatSaturated = fatSaturated ?? nutrition.fatSaturated;
			carbohydratesTotal = carbohydratesTotal ?? nutrition.carbohydratesTotal;
			fiber = fiber ?? nutrition.fiber;
			sugar = sugar ?? nutrition.sugar;
			sodium = sodium ?? nutrition.sodium;
			potassium = potassium ?? nutrition.potassium;
			cholesterol = cholesterol ?? nutrition.cholesterol;
		}

		return this.prisma.foodLog.create({
			data: {
				userId,
				foodName: dto.foodName,
				calories: calories || 0,
				servingSize: servingSize || 0,
				protein: protein || 0,
				fatTotal: fatTotal || 0,
				fatSaturated: fatSaturated || 0,
				carbohydratesTotal: carbohydratesTotal || 0,
				fiber: fiber || 0,
				sugar: sugar || 0,
				sodium: sodium || 0,
				potassium: potassium || 0,
				cholesterol: cholesterol || 0,
				emotionalState: dto.emotionalState,
				eatingContext: dto.eatingContext,
			},
		});
	}

	async getDailyLogs(userId: string, date: Date) {
		const startOfDay = new Date(date);
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date(date);
		endOfDay.setHours(23, 59, 59, 999);

		return this.prisma.foodLog.findMany({
			where: {
				userId,
				loggedAt: {
					gte: startOfDay,
					lte: endOfDay,
				},
			},
			orderBy: {
				loggedAt: 'desc',
			},
		});
	}
}
