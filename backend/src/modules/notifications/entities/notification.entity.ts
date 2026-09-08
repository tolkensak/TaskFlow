// backend/src/modules/notifications/entities/notification.entity.ts

import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';
import GraphQLJSON from 'graphql-type-json';

export enum NotificationType {
    TASK_ASSIGNED = 'TASK_ASSIGNED',
    TASK_UPDATED = 'TASK_UPDATED',
    COMMENT_ADDED = 'COMMENT_ADDED',
    MENTIONED = 'MENTIONED',
}

@ObjectType()
@Entity('notifications')
export class Notification {
    @Field(() => ID)
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field(() => String)
    @Column({ type: 'enum', enum: NotificationType })
    type: NotificationType;

    @Field()
    @Column()
    message: string;

    @Field()
    @Column()
    userId: string;

    @Field()
    @Column({ default: false })
    read: boolean;

    // ✅ Use GraphQLJSON from the package
    @Field(() => GraphQLJSON, { nullable: true })
    @Column({ nullable: true, type: 'json' })
    data: any;

    @Field()
    @CreateDateColumn()
    createdAt: Date;
}
