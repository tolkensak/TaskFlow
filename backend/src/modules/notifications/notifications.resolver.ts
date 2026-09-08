// backend/src/modules/notifications/notifications.resolver.ts

import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { CreateNotificationInput } from './dto/create-notification.input';
import { Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_PUBLISHER, REDIS_SUBSCRIBER } from '../../config/redis.config';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

@Resolver(() => Notification)
export class NotificationsResolver {
    constructor(
        private notificationsService: NotificationsService,
        @Inject(REDIS_PUBLISHER) private publisher: Redis,
        @Inject(REDIS_SUBSCRIBER) private subscriber: Redis,
    ) {}

    // ✅ Remove guards for now to test
    @Query(() => [Notification])
    // @UseGuards(AuthGuard('jwt'))
    async notifications(): Promise<Notification[]> {
        // For testing, return all notifications
        return this.notificationsService.getNotifications(
            '976a2dde-02a8-4a50-adb0-b61cbb2f5858',
        );
    }

    // ✅ Remove guards for now to test
    @Mutation(() => Notification)
    // @UseGuards(AuthGuard('jwt'))
    async createNotification(
        @Args('input') input: CreateNotificationInput,
    ): Promise<Notification> {
        const notification = await this.notificationsService.create({
            type: input.type,
            message: input.message,
            userId: input.userId,
            data: input.data,
        });

        await this.publisher.publish(
            `notifications:${input.userId}`,
            JSON.stringify(notification),
        );

        pubSub.publish('notificationReceived', {
            notificationReceived: notification,
        });

        return notification;
    }

    @Subscription(() => Notification, {
        filter: (payload: any, variables: any) => {
            return payload.notificationReceived.userId === variables.userId;
        },
        resolve: (payload: any) => {
            return payload.notificationReceived;
        },
    })
    notificationReceived(
        @Args('userId') userId: string,
    ): AsyncIterator<unknown> {
        return pubSub.asyncIterableIterator('notificationReceived');
    }
}
