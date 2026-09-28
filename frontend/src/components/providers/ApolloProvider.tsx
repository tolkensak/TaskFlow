"use client";

import { ApolloProvider as Base } from "@apollo/client";
import { client } from "@/lib/apollo-client";

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return <Base client={client}>{children}</Base>;
}