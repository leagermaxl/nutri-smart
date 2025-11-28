import { ApiProperty } from '@nestjs/swagger';
import { EatingContext, EmotionalState } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateFoodLogDto {
	@ApiProperty({
		description: 'The name of the food item',
		example: 'Grilled Chicken Breast',
	})
	@IsString()
	@IsNotEmpty()
	foodName: string;

	@ApiProperty({
		description: 'Calories in the food item',
		example: 165,
		required: false,
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	calories?: number;

	@ApiProperty({
		description: 'Serving size in grams',
		example: 100,
		required: false,
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	servingSize?: number;

	@ApiProperty({
		description: 'Protein content in grams',
		example: 31,
		required: false,
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	protein?: number;

	@ApiProperty({
		description: 'Total fat content in grams',
		example: 3.6,
		required: false,
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	fatTotal?: number;

	@ApiProperty({
		description: 'Saturated fat content in grams',
		example: 1.2,
		required: false,
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	fatSaturated?: number;

	@ApiProperty({
		description: 'Total carbohydrate content in grams',
		example: 0,
		required: false,
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	carbohydratesTotal?: number;

	@ApiProperty({
		description: 'Fiber content in grams',
		example: 0,
		required: false,
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	fiber?: number;

	@ApiProperty({
		description: 'Sugar content in grams',
		example: 0,
		required: false,
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	sugar?: number;

	@ApiProperty({
		description: 'Sodium content in mg',
		example: 50,
		required: false,
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	sodium?: number;

	@ApiProperty({
		description: 'Potassium content in mg',
		example: 100,
		required: false,
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	potassium?: number;

	@ApiProperty({
		description: 'Cholesterol content in mg',
		example: 0,
		required: false,
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	cholesterol?: number;

	@ApiProperty({
		description: 'Emotional state when eating',
		enum: EmotionalState,
		example: EmotionalState.NEUTRAL,
	})
	@IsEnum(EmotionalState)
	emotionalState: EmotionalState;

	@ApiProperty({
		description: 'Context/Location of eating',
		enum: EatingContext,
		example: EatingContext.HOME,
	})
	@IsEnum(EatingContext)
	eatingContext: EatingContext;
}
