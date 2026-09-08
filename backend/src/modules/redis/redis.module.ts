// backend/src/modules/redis/redis.module.ts

import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    createRedisClient,
    REDIS_PUBLISHER,
    REDIS_SUBSCRIBER,
} from '../../config/redis.config';

@Global()
@Module({
    providers: [
        {
            provide: REDIS_PUBLISHER,
            useFactory: (configService: ConfigService) =>
                createRedisClient(configService),
            inject: [ConfigService],
        },
        {
            provide: REDIS_SUBSCRIBER,
            useFactory: (configService: ConfigService) =>
                createRedisClient(configService),
            inject: [ConfigService],
        },
    ],
    exports: [REDIS_PUBLISHER, REDIS_SUBSCRIBER],
})

export class RedisModule {}
