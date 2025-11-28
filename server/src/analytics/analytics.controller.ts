import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { AnalyticsService } from './analytics.service';
import { GenerateAnalysisDto } from './dto/generate-analysis.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analysis')
export class AnalyticsController {
	constructor(private readonly analyticsService: AnalyticsService) {}

	@Post('generate')
	@ApiOperation({ summary: 'Generate AI behavioral analysis for a specific date' })
	@ApiResponse({ status: 201, description: 'Analysis generated successfully.' })
	async generateAnalysis(@Req() req, @Body() dto: GenerateAnalysisDto) {
		const date = new Date(dto.date);
		return this.analyticsService.generateDailyAnalysis(req.user.id, date);
	}

	@Get('history')
	@ApiOperation({ summary: 'Get analysis history' })
	@ApiResponse({ status: 200, description: 'Returns analysis history.' })
	async getHistory(@Req() req) {
		return this.analyticsService.getHistory(req.user.id);
	}
}
