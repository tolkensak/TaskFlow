// frontend/src/components/providers/ApolloProvider.tsx
"use client";

import { ApolloProvider as Base } from "@apollo/client";
import { apolloClient } from "@/lib/apollo-client";  // ← was: client

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return <Base client={apolloClient}>{children}</Base>;  // ← was: client
}