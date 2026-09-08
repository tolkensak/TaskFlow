// backend/src/modules/notifications/notifications.service.ts

import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { REDIS_PUBLISHER, REDIS_SUBSCRIBER } from '../../config/redis.config';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
        @Inject(REDIS_PUBLISHER) private publisher: Redis,
        @Inject(REDIS_SUBSCRIBER) private subscriber: Redis,
    ) {}

    async create(data: {
        type: string;
        message: string;
        userId: string;
        data?: any;
    }): Promise<Notification> {
        // ✅ Create with proper typing
        const notification = this.notificationRepository.create({
            type: data.type as NotificationType,
            message: data.message,
            userId: data.userId,
            data: data.data || null,
            read: false,
        });
        return this.notificationRepository.save(notification);
    }

    async getNotifications(userId: string): Promise<Notification[]> {
        return this.notificationRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async getUnreadNotifications(userId: string): Promise<Notification[]> {
        return this.notificationRepository.find({
            where: { userId, read: false },
            order: { createdAt: 'DESC' },
        });
    }

    async markAsRead(
        userId: string,
        notificationId: string,
    ): Promise<Notification | null> {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId, userId },
        });
        if (notification) {
            notification.read = true;
            await this.notificationRepository.save(notification);
        }
        return notification;
    }

    async markAllAsRead(userId: string): Promise<Notification[]> {
        const notifications = await this.notificationRepository.find({
            where: { userId, read: false },
        });
        for (const notification of notifications) {
            notification.read = true;
        }
        return this.notificationRepository.save(notifications);
    }
}
