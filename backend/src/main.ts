// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as passport from 'passport';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
    });

    app.use(passport.initialize());

    const port = process.env.PORT ?? 3001;
    await app.listen(port);
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(
        `🚀 GraphQL Playground available at http://localhost:${port}/graphql`,
    );
    console.log(
        `🚀 WebSocket endpoint available at ws://localhost:${port}/graphql`,
    );
}

bootstrap();
