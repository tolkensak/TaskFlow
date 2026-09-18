// backend/src/modules/tasks/entities/task-assignment.entity.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Unique,
    Index,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from '../../users/entities/user.entity';

/**
 * TaskAssignment — connects a User to a Task
 *
 * Why a separate entity instead of a ManyToMany join table?
 * - We want to track WHO assigned the task and WHEN
 * - We want to add fields later (e.g., "accepted", "role")
 * - More flexible for real-world apps
 */
@ObjectType()
@Entity('task_assignments')
@Unique(['taskId', 'userId']) // A user can only be assigned to a task once
export class TaskAssignment {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field()
    @Column()
    @Index()
    taskId: string;

    @Field(() => Task)
    @ManyToOne(() => Task, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'taskId' })
    task: Task;

    @Field()
    @Column()
    @Index()
    userId: string;

    @Field(() => User)
    @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Field()
    @Column()
    assignedById: string;

    @Field(() => User)
    @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'assignedById' })
    assignedBy: User;

    @Field()
    @CreateDateColumn()
    assignedAt: Date;
}
