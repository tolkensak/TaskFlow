import { gql } from "@apollo/client";

export const GET_TASKS = gql`
    query GetTasks($projectId: String) {
        tasks(projectId: $projectId) {
            id
            title
            description
            status
            priority
            projectId
            createdAt
        }
    }
`;

export const CREATE_TASK = gql`
    mutation CreateTask($input: CreateTaskInput!) {
        createTask(input: $input) {
            id
            title
            description
            status
            priority
            projectId
            createdAt
        }
    }
`;

export const UPDATE_TASK = gql`
    mutation UpdateTask($id: String!, $input: UpdateTaskInput!) {
        updateTask(id: $id, input: $input) {
            id
            title
            description
            status
            priority
            projectId
            createdAt
            updatedAt
        }
    }
`;

export const UPDATE_TASK_STATUS = gql`
    mutation UpdateTaskStatus($id: String!, $input: UpdateTaskInput!) {
        updateTask(id: $id, input: $input) {
            id
            status
        }
    }
`;

export const DELETE_TASK = gql`
    mutation DeleteTask($id: String!) {
        deleteTask(id: $id)
    }
`;
