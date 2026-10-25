"use client";

import { useSubscription, gql, useApolloClient } from "@apollo/client";
import { GET_TASKS } from "@/lib/graphql/tasks";
import { DEFAULT_PROJECT_ID } from "@/lib/constants";
import type { Task } from "@/types/task";

const TASK_CREATED = gql`
    subscription TaskCreated($projectId: String!) {
        taskCreated(projectId: $projectId) {
            id
            title
            description
            status
            priority
            projectId
            authorId
            createdAt
            updatedAt
        }
    }
`;

const TASK_UPDATED = gql`
    subscription TaskUpdated($projectId: String!) {
        taskUpdated(projectId: $projectId) {
            id
            title
            description
            status
            priority
            projectId
            authorId
            createdAt
            updatedAt
        }
    }
`;

const TASK_DELETED = gql`
    subscription TaskDeleted($projectId: String!) {
        taskDeleted(projectId: $projectId)
    }
`;

export function useTaskSubscriptions() {
    const client = useApolloClient();

    // Helper to get current user ID
    const getCurrentUserId = () => {
        if (typeof window === "undefined") return null;
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser).id : null;
    };

    useSubscription(TASK_CREATED, {
        variables: { projectId: DEFAULT_PROJECT_ID },
        onData: ({ client, data }) => {
            const newTask = data.data?.taskCreated;
            if (!newTask) return;

            const currentUserId = getCurrentUserId();
            if (currentUserId && newTask.authorId !== currentUserId) return; // 👈 Ignore other users' tasks

            const existing = client.readQuery({
                query: GET_TASKS,
                variables: { projectId: DEFAULT_PROJECT_ID },
            });
            if (existing) {
                const taskExists = existing.tasks.some(
                    (t: Task) => t.id === newTask.id,
                );
                if (!taskExists) {
                    client.writeQuery({
                        query: GET_TASKS,
                        variables: { projectId: DEFAULT_PROJECT_ID },
                        data: { tasks: [...existing.tasks, newTask] },
                    });
                }
            }
        },
    });

    useSubscription(TASK_UPDATED, {
        variables: { projectId: DEFAULT_PROJECT_ID },
        onData: ({ client, data }) => {
            const updatedTask = data.data?.taskUpdated;
            if (!updatedTask) return;

            const currentUserId = getCurrentUserId();
            if (currentUserId && updatedTask.authorId !== currentUserId) return; // 👈 Ignore

            const existing = client.readQuery({
                query: GET_TASKS,
                variables: { projectId: DEFAULT_PROJECT_ID },
            });
            if (existing) {
                client.writeQuery({
                    query: GET_TASKS,
                    variables: { projectId: DEFAULT_PROJECT_ID },
                    data: {
                        tasks: existing.tasks.map((t: any) =>
                            t.id === updatedTask.id ? updatedTask : t,
                        ),
                    },
                });
            }
        },
    });

    useSubscription(TASK_DELETED, {
        variables: { projectId: DEFAULT_PROJECT_ID },
        onData: ({ client, data }) => {
            const deletedId = data.data?.taskDeleted;
            if (!deletedId) return;

            // For delete, we don't have the authorId in the payload.
            // But since the backend filters the query, if we don't have it in our cache, it's safe to run the filter anyway.
            const existing = client.readQuery<{ tasks: Task[] }>({
                query: GET_TASKS,
                variables: { projectId: DEFAULT_PROJECT_ID },
            });
            if (!existing) return;

            client.writeQuery({
                query: GET_TASKS,
                variables: { projectId: DEFAULT_PROJECT_ID },
                data: {
                    tasks: existing.tasks.filter((t) => t.id !== deletedId),
                },
            });
            client.cache.gc();
        },
    });
}
