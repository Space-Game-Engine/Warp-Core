import { NestFactory } from '@nestjs/core';
import { ClIModule } from '@warp-core/cli.module';
import { CommandModule, CommandService } from 'nestjs-command';


async function bootstrap() {
    const app = await NestFactory.createApplicationContext(ClIModule, {
        logger: false
    });

    try {
        await app
            .select(CommandModule)
            .get(CommandService)
            .exec();
        await app.close()
    } catch (error) {
        console.error(error);
        await app.close();
        process.exit(1);
    }
}

bootstrap();