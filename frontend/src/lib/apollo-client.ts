// import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
// import { setContext } from "@apollo/client/link/context";

// const httpLink = createHttpLink({
//     uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
//     credentials: "include",
// });

// const authLink = setContext((_, { headers }) => {
//     const token =
//         typeof window !== "undefined"
//             ? localStorage.getItem("accessToken")
//             : null;
//     return {
//         headers: {
//             ...headers,
//             authorization: token ? `Bearer ${token}` : "",
//         },
//     };
// });

// export const client = new ApolloClient({
//     link: authLink.concat(httpLink),
//     cache: new InMemoryCache({
//         typePolicies: {
//             Query: {
//                 fields: {
//                     tasks: {
//                         // Always replace the array — no merging.
//                         // The server is the source of truth for task lists.
//                         merge(_, incoming) {
//                             return incoming;
//                         },
//                     },
//                 },
//             },
//         },
//     }),
// });
// frontend/src/lib/apollo-client.ts
import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const httpLink = new HttpLink({
  uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
});

const authLink = setContext((_, { headers }) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
    connectionParams: {
      authToken: typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
        : null,
    },
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,   // subscriptions go here
  authLink.concat(httpLink)   // ← Combine auth + HTTP  // queries and mutations go here
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});