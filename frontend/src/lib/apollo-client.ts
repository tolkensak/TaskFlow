// frontend/src/lib/apollo-client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
    uri: "http://localhost:3001/graphql", // ✅ Make sure this is correct
    credentials: "include",
});

const authLink = setContext((_, { headers }) => {
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;
    console.log("🔑 Apollo sending token:", token ? "YES" : "NO");
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        },
    };
});

export const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});
