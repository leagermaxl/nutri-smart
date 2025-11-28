import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
	private readonly logger = new Logger(AnalyticsService.name);
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

	async generateDailyAnalysis(userId: string, date: Date) {
		// 1. Fetch food logs for the specific date
		const startOfDay = new Date(date);
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date(date);
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
				loggedAt: 'asc',
			},
		});

		if (logs.length === 0) {
			throw new BadRequestException('No food logs found for this date');
		}

		// 2. Fetch user profile
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				primaryGoal: true,
				age: true,
				gender: true,
				activityLevel: true,
			},
		});

		// 3. Calculate daily totals
		const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);
		const totalProtein = logs.reduce((sum, log) => sum + log.protein, 0);
		const totalCarbs = logs.reduce((sum, log) => sum + log.carbohydratesTotal, 0);
		const totalFats = logs.reduce((sum, log) => sum + log.fatTotal, 0);

		// 4. Construct the prompt for OpenAI
		const prompt = `Act as a nutritional psychologist. Analyze the following user's eating behavior for the day.

User Profile:
- Goal: ${user?.primaryGoal || 'Not specified'}
- Age: ${user?.age || 'Not specified'}
- Gender: ${user?.gender || 'Not specified'}
- Activity Level: ${user?.activityLevel || 'Not specified'}

Daily Summary:
- Total Calories: ${totalCalories} kcal
- Total Protein: ${totalProtein}g
- Total Carbs: ${totalCarbs}g
- Total Fats: ${totalFats}g
- Number of meals/snacks: ${logs.length}

Detailed Logs (with behavioral context):
${logs
	.map(
		(log, i) => `
${i + 1}. ${log.foodName}
   - Calories: ${log.calories} kcal
   - Emotional State: ${log.emotionalState}
   - Eating Context: ${log.eatingContext}
   - Time: ${log.loggedAt.toLocaleTimeString()}
`,
	)
	.join('\n')}

Analyze for:
1. Caloric adherence to goals
2. Emotional eating patterns (e.g., eating unhealthy foods when STRESSED or BORED)
3. Timing/Context issues (e.g., late-night eating, eating at WORK)
4. Macronutrient balance

Return ONLY valid JSON with this exact structure:
{
  "summary": "A 2-3 sentence summary of the day's eating patterns",
  "emotional_pattern": "Description of detected emotional eating pattern or null if none detected",
  "risk_level": "LOW or MEDIUM or HIGH",
  "recommendations": ["Specific actionable tip 1", "Specific actionable tip 2", "Specific actionable tip 3"]
}`;

		// 5. Call OpenAI API
		try {
			const completion = await this.openai.chat.completions.create({
				model: 'x-ai/grok-4.1-fast',
				messages: [
					{
						role: 'system',
						content:
							'You are a professional nutritional psychologist. Provide insightful, evidence-based behavioral analysis.',
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
			const analysis = JSON.parse(responseContent);

			// 6. Save to database
			const savedAnalysis = await this.prisma.aiAnalysis.create({
				data: {
					userId,
					startDate: startOfDay,
					endDate: endOfDay,
					summary: analysis.summary,
					triggerPatterns: {
						emotional_pattern: analysis.emotional_pattern,
					},
					recommendations: analysis.recommendations,
					riskLevel: analysis.risk_level,
				},
			});

			return savedAnalysis;
		} catch (error) {
			this.logger.error(`OpenAI API error: ${error.message}`);
			throw new BadRequestException('Failed to generate analysis');
		}
	}

	async getHistory(userId: string) {
		return this.prisma.aiAnalysis.findMany({
			where: { userId },
			orderBy: { generatedAt: 'desc' },
			take: 10,
		});
	}
}
