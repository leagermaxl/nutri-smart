import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { RecommendationsService } from '../recommendations/recommendations.service';

import { EditUserDto } from './dto/edit-user.dto';

@Injectable()
export class UserService {
	constructor(
		private prisma: PrismaService,
		private recommendationsService: RecommendationsService,
	) {}

	async getMe(userId: string) {
		return this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				age: true,
				weight: true,
				height: true,
				gender: true,
				activityLevel: true,
				primaryGoal: true,
				dietaryRestrictions: true,
				recommendedCalories: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	}

	async editUser(userId: string, dto: EditUserDto) {
		// Update user profile
		const user = await this.prisma.user.update({
			where: { id: userId },
			data: {
				...dto,
			},
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				age: true,
				weight: true,
				height: true,
				gender: true,
				activityLevel: true,
				primaryGoal: true,
				dietaryRestrictions: true,
				recommendedCalories: true,
				updatedAt: true,
			},
		});

		// Recalculate recommended calories if relevant fields changed
		if (
			dto.age !== undefined ||
			dto.weight !== undefined ||
			dto.height !== undefined ||
			dto.gender !== undefined ||
			dto.activityLevel !== undefined ||
			dto.primaryGoal !== undefined ||
			dto.dietaryRestrictions !== undefined
		) {
			const recommendedCalories =
				await this.recommendationsService.calculateRecommendedCalories({
					age: user.age ?? undefined,
					weight: user.weight ?? undefined,
					height: user.height ?? undefined,
					gender: user.gender ?? undefined,
					activityLevel: user.activityLevel ?? undefined,
					primaryGoal: user.primaryGoal ?? undefined,
					dietaryRestrictions: user.dietaryRestrictions ?? undefined,
				});

			await this.prisma.user.update({
				where: { id: userId },
				data: { recommendedCalories },
			});
		}

		return user;
	}
}
