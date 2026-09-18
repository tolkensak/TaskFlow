// backend/src/modules/tasks/entities/task.entity.ts
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OneToMany } from 'typeorm';
import { TaskAssignment } from './task-assignment.entity';
/**
 * Task status enum
 */
export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    REVIEW = 'REVIEW',
    DONE = 'DONE',
}

registerEnumType(TaskStatus, {
    name: 'TaskStatus',
    description: 'The status of a task',
});

/**
 * Task priority enum
 */
export enum TaskPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

registerEnumType(TaskPriority, {
    name: 'TaskPriority',
    description: 'The priority of a task',
});

@ObjectType()
@Entity('tasks')
export class Task {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field()
    @Column()
    title: string;

    @Field({ nullable: true })
    @Column({ type: 'text', nullable: true })
    description: string;

    @Field(() => TaskStatus)
    @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
    status: TaskStatus;

    @Field(() => TaskPriority)
    @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
    priority: TaskPriority;

    @Field()
    @Column()
    projectId: string;

    @Field()
    @Column()
    authorId: string;

    @Field(() => User)
    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'authorId' })
    author: User;

    @Field({ nullable: true })
    @Column({ type: 'timestamp', nullable: true })
    dueDate: Date;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    @Field(() => [TaskAssignment], { nullable: true })
    @OneToMany(() => TaskAssignment, (assignment) => assignment.task, {
        cascade: true,
    })
    assignments: TaskAssignment[];
}
