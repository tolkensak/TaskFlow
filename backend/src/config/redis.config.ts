// backend/src/config/redis.config.ts

import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const createRedisClient = (configService: ConfigService) => {
    // Grab the connection string (preferring configService for consistency)
    const redisUrl = configService.get<string>('REDIS_URL') || process.env.REDIS_URL;
    if (!redisUrl) {
        throw new Error('REDIS_URL is not defined in the environment configuration.');
    }

    return new Redis(redisUrl, {
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        maxRetriesPerRequest: 3,
    });
};

export const REDIS_PUBLISHER = 'REDIS_PUBLISHER';
export const REDIS_SUBSCRIBER = 'REDIS_SUBSCRIBER';
