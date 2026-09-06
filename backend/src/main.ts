// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as passport from 'passport';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // ✅ Enable CORS for frontend
    app.enableCors({
        origin: 'http://localhost:3000',
        credentials: true,
    });

    // ✅ Initialize Passport (THIS IS CRITICAL!)
    app.use(passport.initialize());

    const port = process.env.PORT ?? 3001;
    await app.listen(port);
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(
        `🚀 GraphQL Playground available at http://localhost:${port}/graphql`,
    );
}
bootstrap();
