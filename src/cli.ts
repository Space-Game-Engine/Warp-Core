import {NestFactory} from '@nestjs/core';
import {CommandModule, CommandService} from 'nestjs-command';

import {ClIModule} from '@warp-core/cli.module';

async function bootstrap(): Promise<void> {
	const app = await NestFactory.createApplicationContext(ClIModule, {
		logger: ['log', 'error', 'warn', 'debug', 'verbose'],
	});

	try {
		await app.select(CommandModule).get(CommandService).exec();
		await app.close();
	} catch (error) {
		console.error(error);
		await app.close();
		process.exit(1);
	}
}

bootstrap();
