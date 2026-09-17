// backend/src/modules/presence/presence.service.ts

/**
 * Presence Service - Handles presence data storage and retrieval
 * Uses Redis for fast, in-memory storage
 *
 * Redis Data Structure:
 * - Key: 'presence:users' (Hash)
 *   - Field: userId (string)
 *   - Value: JSON of PresenceData
 *
 * - Key: 'presence:projects:{projectId}' (Set)
 *   - Members: userIds of users viewing this project
 */

import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_PUBLISHER, REDIS_SUBSCRIBER } from '../../config/redis.config';

export interface PresenceData {
    userId: string;
    username: string;
    projectId?: string; // Optional - which project the user is viewing
    lastSeen: Date;
    status: 'online' | 'away' | 'offline';
}

@Injectable()
export class PresenceService {
    // Redis keys for storing presence data
    private readonly PRESENCE_KEY = 'presence:users'; // Hash: userId -> presence data
    private readonly PROJECT_PRESENCE_KEY = 'presence:projects'; // Set: projectId -> userIds

    constructor(
        @Inject(REDIS_PUBLISHER) private publisher: Redis, // For publishing events
        @Inject(REDIS_SUBSCRIBER) private subscriber: Redis, // For subscribing to events
    ) {}

    /**
     * setUserPresence - Mark a user as online
     *
     * 1. Creates presence data with userId, username, status
     * 2. Stores in Redis hash
     * 3. If projectId provided, adds user to project's presence set
     * 4. Publishes presence:update event
     */
    async setUserPresence(
        userId: string,
        username: string,
        projectId?: string,
    ): Promise<void> {
        const presence: PresenceData = {
            userId,
            username,
            projectId,
            lastSeen: new Date(),
            status: 'online',
        };

        // Store in Redis hash: presence:users { userId: JSON(presence) }
        await this.publisher.hset(
            this.PRESENCE_KEY,
            userId,
            JSON.stringify(presence),
        );

        // If user is viewing a project, track project presence
        if (projectId) {
            await this.publisher.sadd(
                `${this.PROJECT_PRESENCE_KEY}:${projectId}`,
                userId,
            );
        }

        // Publish event for other services to listen to
        await this.publisher.publish(
            'presence:update',
            JSON.stringify({ type: 'online', userId, username, projectId }),
        );
    }

    /**
     * getUserPresence - Get a single user's presence data
     *
     * @param userId - The user ID to look up
     * @returns PresenceData or null if not found
     */
    async getUserPresence(userId: string): Promise<PresenceData | null> {
        const data = await this.publisher.hget(this.PRESENCE_KEY, userId);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    }

    /**
     * getAllOnlineUsers - Get all online users
     *
     * Returns an array of all users currently marked as online
     */
    async getAllOnlineUsers(): Promise<PresenceData[]> {
        const data = await this.publisher.hgetall(this.PRESENCE_KEY);
        return Object.values(data).map((item) => JSON.parse(item));
    }

    /**
     * getProjectUsers - Get all users viewing a specific project
     *
     * @param projectId - The project ID to look up
     * @returns Array of PresenceData for users in the project
     */
    async getProjectUsers(projectId: string): Promise<PresenceData[]> {
        // Get all userIds from the project's presence set
        const userIds = await this.publisher.smembers(
            `${this.PROJECT_PRESENCE_KEY}:${projectId}`,
        );

        // Fetch presence data for each user
        const presenceData: PresenceData[] = [];
        for (const userId of userIds) {
            const data = await this.getUserPresence(userId);
            if (data) {
                presenceData.push(data);
            }
        }
        return presenceData;
    }

    /**
     * removeUserPresence - Remove a user from presence tracking
     *
     * Called when a user disconnects or logs out
     * Removes from global presence and all project presence sets
     */
    async removeUserPresence(userId: string): Promise<void> {
        // Get user data before removing (to know which project to clean up)
        const userData = await this.getUserPresence(userId);

        // Remove from global presence hash
        await this.publisher.hdel(this.PRESENCE_KEY, userId);

        // Remove from project presence set if they were in one
        if (userData?.projectId) {
            await this.publisher.srem(
                `${this.PROJECT_PRESENCE_KEY}:${userData.projectId}`,
                userId,
            );
        }

        // Publish offline event
        await this.publisher.publish(
            'presence:update',
            JSON.stringify({ type: 'offline', userId }),
        );
    }

    /**
     * updateUserProject - Update which project a user is viewing
     *
     * Called when a user navigates to a different project
     * Moves user from old project's set to new project's set
     */
    async updateUserProject(userId: string, projectId: string): Promise<void> {
        const userData = await this.getUserPresence(userId);
        if (userData) {
            // Remove from old project set
            if (userData.projectId) {
                await this.publisher.srem(
                    `${this.PROJECT_PRESENCE_KEY}:${userData.projectId}`,
                    userId,
                );
            }

            // Add to new project set
            await this.publisher.sadd(
                `${this.PROJECT_PRESENCE_KEY}:${projectId}`,
                userId,
            );

            // Update user presence with new projectId
            userData.projectId = projectId;
            userData.lastSeen = new Date();
            await this.publisher.hset(
                this.PRESENCE_KEY,
                userId,
                JSON.stringify(userData),
            );
        }
    }

    /**
     * heartbeat - Update a user's lastSeen timestamp
     *
     * Called periodically by the client to confirm they're still active
     * Prevents users from appearing offline after idle timeouts
     */
    async heartbeat(userId: string): Promise<void> {
        const userData = await this.getUserPresence(userId);
        if (userData) {
            userData.lastSeen = new Date();
            await this.publisher.hset(
                this.PRESENCE_KEY,
                userId,
                JSON.stringify(userData),
            );
        }
    }
}
