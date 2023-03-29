import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '@warp-core/app.module';
import { useContainer } from 'class-validator';

async function bootstrap() {
    const appURL = '/graphql';
    const localDocUrl = '/doc';
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
        }),
    );

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    const config = new DocumentBuilder()
        .setTitle('Warp Core web game engine')
        .setDescription('Web game engine REST API points')
        .setVersion('1.0')
        .addTag('GraphQL documentation', 'See all GraphQL functions on that application schema', {
            url: appURL,
            description: 'Main application URL'
        })
        .addTag('Installation', 'How to install own game instance?')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(localDocUrl, app, document);

    await app.listen(3000);
    console.log(`App is loaded at ${(await app.getUrl())}${appURL} URL`);
    console.log(`See documentation at ${(await app.getUrl())}${localDocUrl} URL`);
}
bootstrap();
