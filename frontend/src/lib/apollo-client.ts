// frontend/src/lib/apollo-client.ts

import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// ✅ Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

const httpLink = createHttpLink({
    uri: "http://localhost:3001/graphql",
    credentials: "include",
});

const authLink = setContext((_, { headers }) => {
    const token = isBrowser ? localStorage.getItem("accessToken") : null;
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        },
    };
});

export const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({
        addTypename: false,
    }),
    defaultOptions: {
        query: {
            fetchPolicy: "network-only",
        },
    },
    // ✅ Force disable DevTools
    connectToDevTools: false,
});
