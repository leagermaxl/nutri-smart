import { ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityLevel, Gender, PrimaryGoal } from '@prisma/__generated__/client';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class EditUserDto {
	@ApiPropertyOptional({ example: 'John' })
	@IsOptional()
	@IsString()
	firstName?: string;

	@ApiPropertyOptional({ example: 'Doe' })
	@IsOptional()
	@IsString()
	lastName?: string;

	@ApiPropertyOptional({ example: 25 })
	@IsOptional()
	@IsInt()
	age?: number;

	@ApiPropertyOptional({ example: 70.5, description: 'Weight in kg' })
	@IsOptional()
	@IsNumber()
	@Min(0)
	weight?: number;

	@ApiPropertyOptional({ example: 175, description: 'Height in cm' })
	@IsOptional()
	@IsNumber()
	@Min(0)
	height?: number;

	@ApiPropertyOptional({ example: 'MALE', enum: Gender })
	@IsOptional()
	@IsEnum(Gender)
	gender?: Gender;

	@ApiPropertyOptional({ example: 'MODERATELY_ACTIVE', enum: ActivityLevel })
	@IsOptional()
	@IsEnum(ActivityLevel)
	activityLevel?: ActivityLevel;

	@ApiPropertyOptional({ example: 'WEIGHT_LOSS', enum: PrimaryGoal })
	@IsOptional()
	@IsEnum(PrimaryGoal)
	primaryGoal?: PrimaryGoal;

	@ApiPropertyOptional({ example: 'Vegetarian, no dairy' })
	@IsOptional()
	@IsString()
	dietaryRestrictions?: string;
}
