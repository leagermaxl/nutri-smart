import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMealLogDto {
	@ApiProperty({
		description: 'Natural language query for the meal (e.g., "1 apple and 2 eggs")',
		example: 'Grilled chicken salad',
	})
	@IsString()
	@IsNotEmpty()
	query: string;

	@ApiProperty({
		description: 'Emotional state during the meal',
		example: 'HAPPY',
		required: false,
	})
	@IsString()
	@IsOptional()
	emotionalState?: string;

	@ApiProperty({
		description: 'Context of eating (e.g., HOME, WORK, RESTAURANT)',
		example: 'HOME',
		required: false,
	})
	@IsString()
	@IsOptional()
	eatingContext?: string;
}
