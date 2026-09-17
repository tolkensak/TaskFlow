// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import passport from 'passport';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: 'http://localhost:3000',
        credentials: true,
    });

    app.use(
        session({
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
