// backend/src/modules/tasks/tasks.resolver.ts
import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { PubSub } from 'graphql-subscriptions';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { CreateTaskInput, UpdateTaskInput } from './dto/task.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { REDIS_PUBLISHER } from '../../config/redis.config';

const pubSub = new PubSub();

@Resolver(() => Task)
export class TasksResolver {
    constructor(
        private tasksService: TasksService,
        @Inject(REDIS_PUBLISHER) private publisher: Redis,
    ) {}

    @Query(() => [Task])
    @UseGuards(JwtAuthGuard)
    async tasks(
        @CurrentUser() user: User,
        @Args('projectId', { nullable: true }) projectId?: string,
    ): Promise<Task[]> {
        return this.tasksService.findAll(user.id, projectId);
    }

    @Query(() => Task)
    @UseGuards(JwtAuthGuard)
    async task(@Args('id') id: string): Promise<Task> {
        return this.tasksService.findOne(id);
    }

    @Mutation(() => Task)
    @UseGuards(JwtAuthGuard)
    async createTask(
        @CurrentUser() user: User,
        @Args('input') input: CreateTaskInput,
    ): Promise<Task> {
        const task = await this.tasksService.create(user.id, input);

        // ✅ Publish real-time event
        await this.publisher.publish(
            `task_created:${task.projectId}`,
            JSON.stringify(task),
        );
        pubSub.publish('taskCreated', { taskCreated: task });

        return task;
    }

    @Mutation(() => Task)
    @UseGuards(JwtAuthGuard)
    async updateTask(
        @CurrentUser() user: User,
        @Args('id') id: string,
        @Args('input') input: UpdateTaskInput,
    ): Promise<Task> {
        const task = await this.tasksService.update(user.id, id, input);

        // ✅ Publish real-time event
        await this.publisher.publish(
            `task_updated:${task.id}`,
            JSON.stringify(task),
        );
        pubSub.publish('taskUpdated', { taskUpdated: task });

        return task;
    }

    @Mutation(() => Boolean)
    @UseGuards(JwtAuthGuard)
    async deleteTask(
        @CurrentUser() user: User,
        @Args('id') id: string,
    ): Promise<boolean> {
        return this.tasksService.remove(user.id, id);
    }
    @Mutation(() => Task)
    @UseGuards(JwtAuthGuard)
    async assignUsersToTask(
        @CurrentUser() user: User,
        @Args('taskId') taskId: string,
        @Args('userIds', { type: () => [String] }) userIds: string[],
    ): Promise<Task> {
        const task = await this.tasksService.assignUsers(
            taskId,
            userIds,
            user.id,
        );

        // Publish real-time update
        await this.publisher.publish(
            `task_updated:${task.id}`,
            JSON.stringify(task),
        );
        pubSub.publish('taskUpdated', { taskUpdated: task });

        return task;
    }

    @Mutation(() => Task)
    @UseGuards(JwtAuthGuard)
    async unassignUserFromTask(
        @CurrentUser() user: User,
        @Args('taskId') taskId: string,
        @Args('userId') userId: string,
    ): Promise<Task> {
        const task = await this.tasksService.unassignUser(taskId, userId);

        await this.publisher.publish(
            `task_updated:${task.id}`,
            JSON.stringify(task),
        );
        pubSub.publish('taskUpdated', { taskUpdated: task });

        return task;
    }

    @Query(() => [Task])
    @UseGuards(JwtAuthGuard)
    async myAssignedTasks(@CurrentUser() user: User): Promise<Task[]> {
        return this.tasksService.findAssignedToUser(user.id);
    }

    @Subscription(() => Task, {
        filter: (payload, variables) =>
            payload.taskCreated.projectId === variables.projectId,
        resolve: (payload) => payload.taskCreated,
    })
    taskCreated(@Args('projectId') projectId: string): AsyncIterator<unknown> {
        return pubSub.asyncIterableIterator('taskCreated');
    }

    @Subscription(() => Task, {
        filter: (payload, variables) =>
            payload.taskUpdated.projectId === variables.projectId,
        resolve: (payload) => payload.taskUpdated,
    })
    taskUpdated(@Args('projectId') projectId: string): AsyncIterator<unknown> {
        return pubSub.asyncIterableIterator('taskUpdated');
    }
}
