// frontend/src/graphql/queries/user.ts

import { gql } from "@apollo/client";

export const GET_ME = gql`
    query Me {
        me {
            id
            email
            name
            avatar
            createdAt
            updatedAt
        }
    }
`;

export const GET_USERS = gql`
    query Users {
        users {
            id
            email
            name
            avatar
            createdAt
        }
    }
`;
