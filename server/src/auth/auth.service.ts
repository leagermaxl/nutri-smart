import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { RecommendationsService } from '../recommendations/recommendations.service';

import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
		private recommendationsService: RecommendationsService,
	) {}

	async register(dto: RegisterDto) {
		const hash = await bcrypt.hash(dto.password, 10);

		try {
			const user = await this.prisma.user.create({
				data: {
					email: dto.email,
					passwordHash: hash,
					firstName: dto.firstName,
					lastName: dto.lastName,
					age: dto.age,
					weight: dto.weight,
					height: dto.height,
					gender: dto.gender as any,
					activityLevel: dto.activityLevel as any,
					primaryGoal: dto.primaryGoal,
					dietaryRestrictions: dto.dietaryRestrictions,
				},
			});

			// Calculate recommended calories based on user profile
			const recommendedCalories =
				await this.recommendationsService.calculateRecommendedCalories({
					age: dto.age,
					weight: dto.weight,
					height: dto.height,
					gender: dto.gender,
					activityLevel: dto.activityLevel,
					primaryGoal: dto.primaryGoal,
					dietaryRestrictions: dto.dietaryRestrictions,
				});

			await this.prisma.user.update({
				where: { id: user.id },
				data: { recommendedCalories },
			});

			return this.signToken(user.id, user.email);
		} catch (error) {
			if (error.code === 'P2002') {
				throw new ForbiddenException('Credentials taken');
			}
			throw error;
		}
	}

	async login(dto: LoginDto) {
		const user = await this.prisma.user.findUnique({
			where: {
				email: dto.email,
			},
		});

		if (!user) throw new ForbiddenException('Credentials incorrect');

		const pwMatches = await bcrypt.compare(dto.password, user.passwordHash);
		if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

		return this.signToken(user.id, user.email);
	}

	async signToken(userId: string, email: string): Promise<{ access_token: string }> {
		const payload = {
			sub: userId,
			email,
		};
		const secret = process.env.JWT_SECRET;

		const token = await this.jwt.signAsync(payload, {
			expiresIn: '3h',
			secret: secret,
		});

		return {
			access_token: token,
		};
	}
}
