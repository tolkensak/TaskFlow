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

    // Identify the field we modify on the cache
    const tasksFieldName =
        client.cache.identify({
            __typename: "Query",
            id: null,
        } as any) || "ROOT_QUERY";

    useSubscription(TASK_CREATED, {
        variables: { projectId: DEFAULT_PROJECT_ID },
        onData: ({ client: c, data }) => {
            const task = data.data?.taskCreated;
            if (!task) return;

            c.cache.modify({
                fields: {
                    tasks(existingTaskRefs = [], { toReference }) {
                        const refs = existingTaskRefs as any[];
                        // Avoid duplicates
                        const alreadyExists = refs.some(
                            (ref) => ref.__ref === `Task:${task.id}`,
                        );
                        if (alreadyExists) return refs;
                        return [...refs, toReference(task)];
                    },
                },
            });
        },
    });

    useSubscription(TASK_UPDATED, {
        variables: { projectId: DEFAULT_PROJECT_ID },
        onData: ({ client: c, data }) => {
            const task = data.data?.taskUpdated;
            if (!task) return;

            // The normalized cache updates Task:<id> automatically.
            // No need to modify the array — Apollo will notify watchers.
        },
    });

    useSubscription(TASK_DELETED, {
        variables: { projectId: DEFAULT_PROJECT_ID },
        onData: ({ client: c, data }) => {
            const deletedId = data.data?.taskDeleted;
            if (!deletedId) return;

            c.cache.modify({
                fields: {
                    tasks(existingTaskRefs = [], { readField }) {
                        const refs = existingTaskRefs as any[];
                        return refs.filter((ref) => {
                            const id = readField<string>("id", ref);
                            return id !== deletedId;
                        });
                    },
                },
            });

            c.cache.evict({ id: `Task:${deletedId}` });
            c.cache.gc();
        },
    });
}
