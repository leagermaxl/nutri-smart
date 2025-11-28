import { Module } from '@nestjs/common';

import { NutritionModule } from '../nutrition/nutrition.module';
import { PrismaModule } from '../prisma/prisma.module';

import { FoodDiaryController } from './food-diary.controller';
import { FoodDiaryService } from './food-diary.service';

@Module({
	imports: [PrismaModule, NutritionModule],
	controllers: [FoodDiaryController],
	providers: [FoodDiaryService],
})
export class FoodDiaryModule {}
