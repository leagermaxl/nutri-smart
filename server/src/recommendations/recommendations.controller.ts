import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RecommendationsService } from './recommendations.service';

@ApiTags('Recommendations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recommendations')
export class RecommendationsController {
	constructor(private recommendationsService: RecommendationsService) {}

	@Get('food-suggestions')
	@ApiOperation({ summary: 'Get personalized food suggestions' })
	@ApiResponse({ status: 200, description: 'Return food suggestions.' })
	async getFoodSuggestions(@Req() req) {
		const userId = req.user.id;

		// Fetch complete user profile
		const user = await this.recommendationsService['prisma'].user.findUnique({
			where: { id: userId },
			select: {
				age: true,
				weight: true,
				height: true,
				gender: true,
				activityLevel: true,
				primaryGoal: true,
				dietaryRestrictions: true,
				recommendedCalories: true,
			},
		});

		const userProfile = {
			age: user?.age ?? undefined,
			weight: user?.weight ?? undefined,
			height: user?.height ?? undefined,
			gender: user?.gender ?? undefined,
			activityLevel: user?.activityLevel ?? undefined,
			primaryGoal: user?.primaryGoal ?? undefined,
			dietaryRestrictions: user?.dietaryRestrictions ?? undefined,
		};

		const recommendedCalories = user?.recommendedCalories || 2000;

		return this.recommendationsService.getFoodSuggestions(
			userId,
			userProfile,
			recommendedCalories,
		);
	}
}
