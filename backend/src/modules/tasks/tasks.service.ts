// backend/src/modules/tasks/tasks.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskInput, UpdateTaskInput } from './dto/task.input';
import { TaskAssignment } from './entities/task-assignment.entity';
import { In } from 'typeorm';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
        @InjectRepository(TaskAssignment)
        private assignmentsRepository: Repository<TaskAssignment>,
    ) {}

    async create(userId: string, input: CreateTaskInput): Promise<Task> {
        // Step 1: Create the task
        const task = this.tasksRepository.create({
            ...input,
            authorId: userId,
        });

        // Step 2: Save it
        const saved = await this.tasksRepository.save(task);

        // ✅ Step 3: Re-fetch with the author relation
        return this.findOne(saved.id);
    }

    async findAll(userId: string, projectId?: string): Promise<Task[]> {
        const where: any = {};
        if (projectId) where.projectId = projectId;

        return this.tasksRepository.find({
            where,
            relations: ['author', 'assignments', 'assignments.user', 'assignments.assignedBy'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Task> {
        const task = await this.tasksRepository.findOne({
            where: { id },
            relations: ['author', 'assignments', 'assignments.user', 'assignments.assignedBy'],
        });
        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }
        return task;
    }

    async update(
        userId: string,
        id: string,
        input: UpdateTaskInput,
    ): Promise<Task> {
        const task = await this.findOne(id);
        Object.assign(task, input);
        await this.tasksRepository.save(task);

        // ✅ Re-fetch to include the latest relations
        return this.findOne(id);
    }

    async remove(userId: string, id: string): Promise<boolean> {
        const task = await this.findOne(id);
        await this.tasksRepository.remove(task);
        return true;
    }

    /**
     * Assign multiple users to a task
     *
     * Skips users who are already assigned to avoid duplicates.
     */
    async assignUsers(
        taskId: string,
        userIds: string[],
        assignedById: string,
    ): Promise<Task> {
        // Verify the task exists
        const task = await this.findOne(taskId);

        // Find existing assignments to skip duplicates
        const existing = await this.assignmentsRepository.find({
            where: {
                taskId,
                userId: In(userIds),
            },
        });

        const existingUserIds = new Set(existing.map((a) => a.userId));
        const newUserIds = userIds.filter((id) => !existingUserIds.has(id));

        // Create new assignments
        const newAssignments = newUserIds.map((userId) =>
            this.assignmentsRepository.create({
                taskId,
                userId,
                assignedById,
            }),
        );

        if (newAssignments.length > 0) {
            await this.assignmentsRepository.save(newAssignments);
        }

        // Re-fetch with assignments
        return this.findOne(taskId);
    }

    /**
     * Unassign a user from a task
     */
    async unassignUser(taskId: string, userId: string): Promise<Task> {
        await this.assignmentsRepository.delete({ taskId, userId });
        return this.findOne(taskId);
    }

    /**
     * Get all tasks assigned to a specific user
     */
    async findAssignedToUser(userId: string): Promise<Task[]> {
        const assignments = await this.assignmentsRepository.find({
            where: { userId },
            relations: ['task'],
        });
        return assignments.map((a) => a.task);
    }
}
