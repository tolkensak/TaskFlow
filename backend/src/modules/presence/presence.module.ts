// backend/src/modules/presence/presence.module.ts

import { Module } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { PresenceGateway } from './presence.gateway';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [RedisModule],
    providers: [PresenceService, PresenceGateway],
    exports: [PresenceService],
})

export class PresenceModule {}
