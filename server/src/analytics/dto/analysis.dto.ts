import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsJSON, IsNotEmpty, IsString } from 'class-validator';

export class AnalysisDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	id: string;

	@ApiProperty()
	@IsDate()
	startDate: Date;

	@ApiProperty()
	@IsDate()
	endDate: Date;

	@ApiProperty()
	@IsString()
	summary: string;

	@ApiProperty()
	@IsJSON()
	triggerPatterns: any;

	@ApiProperty()
	@IsJSON()
	recommendations: any;

	@ApiProperty()
	@IsString()
	riskLevel: string;
}
