import {ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {useContainer} from 'class-validator';

import {AppModule} from '@warp-core/app.module';
import {HttpExceptionFilter} from '@warp-core/exception.filter';

async function bootstrap(): Promise<void> {
	const appURL = '/graphql';
	const localDocUrl = '/doc';
	const app = await NestFactory.create(AppModule, {
		cors: {
			origin: false,
		},
	});
	app.useGlobalFilters(new HttpExceptionFilter());
	app.useGlobalPipes(new ValidationPipe());

	useContainer(app.select(AppModule), {fallbackOnErrors: true});

	const config = new DocumentBuilder()
		.setTitle('Warp Core web game engine')
		.setDescription('Web game engine REST API points')
		.setVersion('Alpha 0.1')
		.addTag(
			'GraphQL documentation',
			'See all GraphQL functions on that application schema',
			{
				url: appURL,
				description: 'Main application URL',
			},
		)
		.addTag('Installation', 'How to install own game instance?', {
			url: 'https://github.com/Space-Game-Engine/Warp-Core/blob/main/docs/install/installation.md',
			description: 'GitHub installation instructions',
		})
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup(localDocUrl, app, document);

	await app.listen(3000);
	console.log(`App is loaded at ${await app.getUrl()}${appURL} URL`);
	console.log(`See documentation at ${await app.getUrl()}${localDocUrl} URL`);
}
bootstrap();
