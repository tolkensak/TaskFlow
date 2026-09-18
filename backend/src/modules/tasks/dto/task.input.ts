// backend/src/modules/tasks/dto/task.input.ts
import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

@InputType()
export class CreateTaskInput {
    @Field()
    @IsNotEmpty()
    title: string;

    @Field({ nullable: true })
    @IsOptional()
    description?: string;

    @Field(() => TaskStatus, { nullable: true })
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @Field(() => TaskPriority, { nullable: true })
    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @Field()
    @IsNotEmpty()
    projectId: string;

    @Field({ nullable: true })
    @IsOptional()
    dueDate?: Date;
}

@InputType()
export class UpdateTaskInput {
    @Field({ nullable: true })
    @IsOptional()
    title?: string;

    @Field({ nullable: true })
    @IsOptional()
    description?: string;

    @Field(() => TaskStatus, { nullable: true })
    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @Field(() => TaskPriority, { nullable: true })
    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @Field({ nullable: true })
    @IsOptional()
    dueDate?: Date;
}
