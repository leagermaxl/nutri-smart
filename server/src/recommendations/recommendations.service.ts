import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { PrismaService } from '../prisma/prisma.service';

interface UserProfile {
	age?: number;
	weight?: number;
	height?: number;
	gender?: string;
	activityLevel?: string;
	primaryGoal?: string;
	dietaryRestrictions?: string;
}

@Injectable()
export class RecommendationsService {
	private readonly logger = new Logger(RecommendationsService.name);
	private readonly openai: OpenAI;

	constructor(
		private readonly prisma: PrismaService,
		private readonly configService: ConfigService,
	) {
		const apiKey = this.configService.get<string>('OPENAI_API_KEY');
		const baseURL = 'https://openrouter.ai/api/v1';
		if (!apiKey) {
			this.logger.warn('OPENAI_API_KEY is not set');
		}
		this.openai = new OpenAI({ apiKey, baseURL });
	}

	async calculateRecommendedCalories(userProfile: UserProfile): Promise<number> {
		const prompt = `Act as a professional nutritionist. Calculate the recommended daily calorie intake for a user with the following profile:

- Age: ${userProfile.age || 'Not specified'}
- Weight: ${userProfile.weight || 'Not specified'} kg
- Height: ${userProfile.height || 'Not specified'} cm
- Gender: ${userProfile.gender || 'Not specified'}
- Activity Level: ${userProfile.activityLevel || 'Not specified'}
- Primary Goal: ${userProfile.primaryGoal || 'Not specified'}
- Dietary Restrictions: ${userProfile.dietaryRestrictions || 'None'}

Based on this information, calculate the recommended daily calorie intake using established nutritional formulas (e.g., Mifflin-St Jeor equation adjusted for activity level and goals).

Return ONLY valid JSON with this exact structure:
{
  "recommended_calories": 2000,
  "explanation": "Brief explanation of the calculation"
}`;

		try {
			const completion = await this.openai.chat.completions.create({
				model: 'x-ai/grok-4.1-fast',
				messages: [
					{
						role: 'system',
						content:
							'You are a professional nutritionist. Provide accurate, evidence-based calorie recommendations.',
					},
					{
						role: 'user',
						content: prompt,
					},
				],
				response_format: { type: 'json_object' },
				temperature: 0.3,
			});

			const responseContent = completion.choices[0].message.content;
			if (!responseContent) {
				throw new Error('No response content received from OpenAI');
			}
			const result = JSON.parse(responseContent);

			this.logger.log(
				`Calculated recommended calories: ${result.recommended_calories} for user`,
			);
			return Math.round(result.recommended_calories);
		} catch (error) {
			this.logger.error(`OpenAI API error: ${error.message}`);
			// Return a default value if API fails
			return 2000;
		}
	}

	async getFoodSuggestions(
		userId: string,
		userProfile: UserProfile,
		recommendedCalories: number,
	) {
		// Fetch today's food logs
		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date();
		endOfDay.setHours(23, 59, 59, 999);

		const logs = await this.prisma.foodLog.findMany({
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

		// Calculate current totals
		const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);
		const totalProtein = logs.reduce((sum, log) => sum + log.protein, 0);
		const totalCarbs = logs.reduce((sum, log) => sum + log.carbohydratesTotal, 0);
		const totalFats = logs.reduce((sum, log) => sum + log.fatTotal, 0);

		const remainingCalories = recommendedCalories - totalCalories;

		// Format detailed food list for the prompt
		const foodsEatenToday =
			logs.length > 0
				? logs
						.map(
							(log, i) =>
								`${i + 1}. ${log.foodName} - ${Math.round(log.calories)} kcal (P: ${Math.round(log.protein)}g, C: ${Math.round(log.carbohydratesTotal)}g, F: ${Math.round(log.fatTotal)}g)`,
						)
						.join('\n')
				: 'No meals logged yet today';

		const prompt = `Act as a nutritionist. Provide personalized food suggestions for a user.

User Profile:
- Goal: ${userProfile.primaryGoal || 'Not specified'}
- Activity Level: ${userProfile.activityLevel || 'Not specified'}
- Dietary Restrictions: ${userProfile.dietaryRestrictions || 'None'}

Daily Target:
- Recommended Calories: ${recommendedCalories} kcal

Current Intake (today):
- Consumed Calories: ${Math.round(totalCalories)} kcal
- Remaining Calories: ${Math.round(remainingCalories)} kcal
- Protein: ${Math.round(totalProtein)}g
- Carbs: ${Math.round(totalCarbs)}g
- Fats: ${Math.round(totalFats)}g

Foods Already Eaten Today:
${foodsEatenToday}

Provide 3-5 specific food suggestions that:
1. Fit within remaining calorie budget (${Math.round(remainingCalories)} kcal remaining)
2. Respect dietary restrictions
3. Help achieve nutritional balance based on what they've already eaten
4. Support the user's primary goal
5. Avoid repeating foods they've already consumed today (unless beneficial for their goal)

Return ONLY valid JSON with this exact structure:
{
  "suggestions": [
    {
      "food": "Food name",
      "portion": "Portion size",
      "calories": 250,
      "reason": "Why this food is recommended"
    }
  ],
  "summary": "Brief summary of recommendations"
}`;

		try {
			const completion = await this.openai.chat.completions.create({
				model: 'x-ai/grok-4.1-fast',
				messages: [
					{
						role: 'system',
						content:
							'You are a professional nutritionist. Provide practical, personalized food recommendations.',
					},
					{
						role: 'user',
						content: prompt,
					},
				],
				response_format: { type: 'json_object' },
				temperature: 0.7,
			});

			const responseContent = completion.choices[0].message.content;
			if (!responseContent) {
				throw new Error('No response content received from OpenAI');
			}
			const result = JSON.parse(responseContent);

			return {
				...result,
				remainingCalories: Math.round(remainingCalories),
				consumedCalories: Math.round(totalCalories),
				recommendedCalories,
			};
		} catch (error) {
			this.logger.error(`OpenAI API error: ${error.message}`);
			return {
				suggestions: [],
				summary: 'Unable to generate suggestions at this time.',
				remainingCalories: Math.round(remainingCalories),
				consumedCalories: Math.round(totalCalories),
				recommendedCalories,
			};
		}
	}
}
