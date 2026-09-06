// frontend/src/graphql/mutations/auth.ts

import { gql } from "@apollo/client";

export const REGISTER_MUTATION = gql`
    mutation Register($input: RegisterInput!) {
        register(input: $input) {
            accessToken
            refreshToken
            user {
                id
                email
                name
                createdAt
            }
        }
    }
`;

export const LOGIN_MUTATION = gql`
    mutation Login($input: LoginInput!) {
        login(input: $input) {
            accessToken
            refreshToken
            user {
                id
                email
                name
            }
        }
    }
`;
