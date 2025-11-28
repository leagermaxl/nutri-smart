import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { RecommendationsModule } from '../recommendations/recommendations.module';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
	imports: [PrismaModule, RecommendationsModule],
	controllers: [UserController],
	providers: [UserService],
})
export class UserModule {}
