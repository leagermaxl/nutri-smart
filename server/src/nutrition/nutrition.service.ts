import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';

import { PrismaService } from '../prisma/prisma.service';

export interface NutritionData {
	name: string;
	calories: number;
	servingSize: number;
	protein: number;
	fatTotal: number;
	fatSaturated: number;
	carbohydratesTotal: number;
	fiber: number;
	sugar: number;
	sodium: number;
	potassium: number;
	cholesterol: number;
}

@Injectable()
export class NutritionService {
	private readonly logger = new Logger(NutritionService.name);
	private readonly apiKey: string;
	private readonly apiUrl = 'https://api.calorieninjas.com/v1/nutrition';

	constructor(
		private readonly httpService: HttpService,
		private readonly configService: ConfigService,
		private readonly prisma: PrismaService,
	) {
		this.apiKey = this.configService.get<string>('CALORIE_NINJAS_API_KEY') || '';
	}

	async fetchNutritionData(query: string, userId?: string): Promise<NutritionData> {
		if (!this.apiKey) {
			this.logger.warn('CALORIE_NINJAS_API_KEY is not set');
			throw new BadRequestException('Nutrition API is not configured');
		}

		try {
			const { data } = await firstValueFrom(
				this.httpService.get(this.apiUrl, {
					params: { query },
					headers: { 'X-Api-Key': this.apiKey },
				}),
			);

			if (!data.items || data.items.length === 0) {
				throw new BadRequestException(`No nutrition data found for: ${query}`);
			}

			// Store the raw API response in the database
			await this.prisma.nutritionApiResponse.create({
				data: {
					userId,
					query,
					rawResponse: data,
					itemCount: data.items.length,
				},
			});

			// Aggregate all items (sum their nutritional values)
			const aggregated = data.items.reduce(
				(acc: any, item: any) => ({
					calories: acc.calories + item.calories,
					servingSize: acc.servingSize + item.serving_size_g,
					protein: acc.protein + item.protein_g,
					fatTotal: acc.fatTotal + item.fat_total_g,
					fatSaturated: acc.fatSaturated + item.fat_saturated_g,
					carbohydratesTotal: acc.carbohydratesTotal + item.carbohydrates_total_g,
					fiber: acc.fiber + item.fiber_g,
					sugar: acc.sugar + item.sugar_g,
					sodium: acc.sodium + item.sodium_mg,
					potassium: acc.potassium + item.potassium_mg,
					cholesterol: acc.cholesterol + item.cholesterol_mg,
				}),
				{
					calories: 0,
					servingSize: 0,
					protein: 0,
					fatTotal: 0,
					fatSaturated: 0,
					carbohydratesTotal: 0,
					fiber: 0,
					sugar: 0,
					sodium: 0,
					potassium: 0,
					cholesterol: 0,
				},
			);

			return {
				name: data.items.map((item: any) => item.name).join(', '),
				...aggregated,
			};
		} catch (error) {
			this.logger.error(`Error fetching nutrition data: ${error.message}`);
			if (error instanceof BadRequestException) throw error;
			throw new BadRequestException('Failed to fetch nutrition data');
		}
	}

	async logMeal(userId: string, query: string, emotionalState: string, eatingContext: string) {
		// Fetch nutrition data from API (this stores the raw response)
		const nutritionResponse = await firstValueFrom(
			this.httpService.get(this.apiUrl, {
				params: { query },
				headers: { 'X-Api-Key': this.apiKey },
			}),
		);

		if (!nutritionResponse.data.items || nutritionResponse.data.items.length === 0) {
			throw new BadRequestException(`No nutrition data found for: ${query}`);
		}

		// Store the raw API response
		await this.prisma.nutritionApiResponse.create({
			data: {
				userId,
				query,
				rawResponse: nutritionResponse.data,
				itemCount: nutritionResponse.data.items.length,
			},
		});

		// Generate a unique mealGroupId for this meal
		const mealGroupId = crypto.randomUUID();

		// Create individual FoodLog entries for each item
		const foodLogs = await Promise.all(
			nutritionResponse.data.items.map((item: any) =>
				this.prisma.foodLog.create({
					data: {
						userId,
						foodName: item.name,
						calories: item.calories,
						servingSize: item.serving_size_g,
						protein: item.protein_g,
						fatTotal: item.fat_total_g,
						fatSaturated: item.fat_saturated_g,
						carbohydratesTotal: item.carbohydrates_total_g,
						fiber: item.fiber_g,
						sugar: item.sugar_g,
						sodium: item.sodium_mg,
						potassium: item.potassium_mg,
						cholesterol: item.cholesterol_mg,
						emotionalState: emotionalState as any,
						eatingContext: eatingContext as any,
						mealGroupId,
					},
				}),
			),
		);

		return {
			mealGroupId,
			itemCount: foodLogs.length,
			items: foodLogs,
		};
	}
}
