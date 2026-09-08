// backend/src/modules/notifications/dto/create-notification.input.ts

import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateNotificationInput {
    @Field()
    @IsNotEmpty()
    type: string;

    @Field()
    @IsNotEmpty()
    message: string;

    @Field()
    @IsNotEmpty()
    userId: string;

    // ✅ Add GraphQLJSON type here too
    @Field(() => GraphQLJSON, { nullable: true })
    @IsOptional()
    data?: any;
}
