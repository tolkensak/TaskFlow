// backend/src/modules/notifications/notifications.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsResolver } from './notifications.resolver';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [TypeOrmModule.forFeature([Notification]), RedisModule],
    providers: [NotificationsResolver, NotificationsService],
    exports: [NotificationsService],
})

export class NotificationsModule {}
