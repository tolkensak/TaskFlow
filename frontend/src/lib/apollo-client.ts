// frontend/src/lib/apollo-client.ts

import {
    ApolloClient,
    InMemoryCache,
    createHttpLink,
    split,
} from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { setContext } from "@apollo/client/link/context";
import { getMainDefinition } from "@apollo/client/utilities";

const httpLink = createHttpLink({
    uri: "http://localhost:3001/graphql",
    credentials: "include",
});

const authLink = setContext((_, { headers }) => {
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        },
    };
});

// ✅ WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
    createClient({
        url: "ws://localhost:3001/graphql",
        connectionParams: () => {
            const token =
                typeof window !== "undefined"
                    ? localStorage.getItem("accessToken")
                    : null;
            return {
                authorization: token ? `Bearer ${token}` : "",
            };
        },
    }),
);

// ✅ Split links based on operation type
const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
        );
    },
    wsLink,
    authLink.concat(httpLink),
);

export const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache({
        addTypename: false,
    }),
    defaultOptions: {
        query: {
            fetchPolicy: "network-only",
        },
    },
    connectToDevTools: false,
});
