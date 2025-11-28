import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.use(cookieParser());

	app.enableCors({
		origin: 'http://localhost:3000',
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		credentials: true,
	});

	const config = app.get(ConfigService);
	const configS = new DocumentBuilder()
		.setTitle('NutriSmart API')
		.setDescription('API for Master Thesis Project')
		.setVersion('1.0')
		.build();
	const document = SwaggerModule.createDocument(app, configS);
	SwaggerModule.setup('api', app, document);

	await app.listen(config.getOrThrow<number>('PORT'));
}
void bootstrap();
