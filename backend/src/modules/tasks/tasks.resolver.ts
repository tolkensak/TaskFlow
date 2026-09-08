// backend/src/modules/tasks/tasks.resolver.ts

import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_PUBLISHER } from '../../config/redis.config';

// Placeholder resolver - we'll implement full tasks later
@Resolver()
export class TasksResolver {
    constructor(@Inject(REDIS_PUBLISHER) private publisher: Redis) {}

    @Query(() => String)
    async tasksPlaceholder(): Promise<string> {
        return 'Tasks module coming soon!';
    }
}
