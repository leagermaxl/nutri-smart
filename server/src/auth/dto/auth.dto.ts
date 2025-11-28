import { ApiProperty } from '@nestjs/swagger';
import { ActivityLevel, Gender, PrimaryGoal } from '@prisma/__generated__/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
	@ApiProperty({ example: 'user@example.com', description: 'User email' })
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({ example: 'John', description: 'First name', required: false })
	@IsOptional()
	@IsString()
	firstName?: string;

	@ApiProperty({ example: 'Doe', description: 'Last name', required: false })
	@IsOptional()
	@IsString()
	lastName?: string;

	@ApiProperty({ example: 'password123', description: 'User password (min 6 chars)' })
	@IsString()
	@IsNotEmpty()
	@MinLength(6)
	password: string;

	@ApiProperty({ example: 25, description: 'Age', required: false })
	@IsOptional()
	age?: number;

	@ApiProperty({ example: 70, description: 'Weight in kg', required: false })
	@IsOptional()
	weight?: number;

	@ApiProperty({ example: 175, description: 'Height in cm', required: false })
	@IsOptional()
	height?: number;

	@ApiProperty({ example: 'MALE', enum: Gender, description: 'Gender', required: false })
	@IsOptional()
	@IsEnum(Gender)
	gender?: Gender;

	@ApiProperty({
		example: 'SEDENTARY',
		enum: ActivityLevel,
		description: 'Activity Level',
		required: false,
	})
	@IsOptional()
	@IsEnum(ActivityLevel)
	activityLevel?: ActivityLevel;

	@ApiProperty({
		example: 'WEIGHT_LOSS',
		enum: PrimaryGoal,
		description: 'Primary Goal',
		required: false,
	})
	@IsOptional()
	@IsEnum(PrimaryGoal)
	primaryGoal?: PrimaryGoal;

	@ApiProperty({
		example: 'Vegetarian, no dairy',
		description: 'Dietary restrictions or allergies',
		required: false,
	})
	@IsOptional()
	@IsString()
	dietaryRestrictions?: string;
}

export class LoginDto {
	@ApiProperty({ example: 'user@example.com', description: 'User email' })
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({ example: 'password123', description: 'User password' })
	@IsString()
	@IsNotEmpty()
	password: string;
}
