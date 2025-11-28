import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class GenerateAnalysisDto {
	@ApiProperty({
		description: 'Date for analysis (ISO format)',
		example: '2024-11-23',
	})
	@IsNotEmpty()
	@IsDateString()
	date: string;
}
