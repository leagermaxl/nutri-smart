import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { NutritionController } from 'src/nutrition/nutrition.controller';
import { NutritionService } from 'src/nutrition/nutrition.service';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
	imports: [HttpModule, PrismaModule],
	controllers: [NutritionController],
	providers: [NutritionService],
	exports: [NutritionService],
})
export class NutritionModule {}
