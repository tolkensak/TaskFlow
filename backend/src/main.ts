// backend/src/main.ts

import session from 'express-session';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import passport from 'passport';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
        .split(',')
        .map((o) => o.trim());

    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
    });

    const redisClient = new Redis(process.env.REDIS_URL!);

    app.use(
        session({
            store: new RedisStore({ client: redisClient }),
            secret: process.env.JWT_SECRET || 'default-secret',
            resave: false,
            saveUninitialized: false,
            cookie: { maxAge: 60000 * 60 * 24 },
        }),
    );

    app.use(passport.initialize());
    // ✅ REMOVE passport.session() - not needed with custom guard

    const port = process.env.PORT ?? 3001;
    await app.listen(port);
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(
        `🚀 GraphQL Playground available at http://localhost:${port}/graphql`,
    );
}

bootstrap();
