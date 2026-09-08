// backend/src/graphql/graphql.module.ts

import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import GraphQLJSON from 'graphql-type-json';

@Module({
    imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
            sortSchema: true,
            playground: true,
            // ✅ Use graphql-ws for subscriptions
            subscriptions: {
                'graphql-ws': true,
            },
            context: ({ req, res }) => ({ req, res }),
            installSubscriptionHandlers: true,
            resolvers: {
                JSON: GraphQLJSON,
            },
            // ✅ Important for GraphQL Playground to find the WebSocket endpoint
            path: '/graphql',
        }),
    ],
})

export class GraphqlModule {}
