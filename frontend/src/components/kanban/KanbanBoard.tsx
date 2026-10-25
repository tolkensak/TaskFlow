"use client";

import { useQuery, useMutation, useSubscription, gql } from "@apollo/client";
import { useRef, useState } from "react";
import type { Task, TaskStatus } from "@/types/task";
import { GET_TASKS, UPDATE_TASK_STATUS } from "@/lib/graphql/tasks";
import { KanbanColumn } from "./KanbanColumn";
import { TaskDialog } from "./TaskDialog";
import { DEFAULT_PROJECT_ID } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useTaskSubscriptions } from "@/hooks/useTaskSubscriptions";
import Link from "next/link";
import { useRouter } from "next/navigation";

const COLUMNS: { status: TaskStatus; title: string; color: string }[] = [
    { status: "TODO", title: "📋 To Do", color: "bg-slate-900" },
    { status: "IN_PROGRESS", title: "🚧 In Progress", color: "bg-blue-950" },
    { status: "REVIEW", title: "👀 Review", color: "bg-amber-950" },
    { status: "DONE", title: "✅ Done", color: "bg-green-950" },
];

const TASK_CREATED_SUBSCRIPTION = gql`
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

const TASK_UPDATED_SUBSCRIPTION = gql`
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

const TASK_DELETED_SUBSCRIPTION = gql`
    subscription TaskDeleted($projectId: String!) {
        taskDeleted(projectId: $projectId)
    }
`;

export function KanbanBoard() {
    const { data, loading, error, refetch } = useQuery(GET_TASKS, {
        variables: { projectId: DEFAULT_PROJECT_ID },
        fetchPolicy: "cache-and-network",
    });

    useTaskSubscriptions();

    useSubscription(TASK_CREATED_SUBSCRIPTION, {
        variables: { projectId: DEFAULT_PROJECT_ID },
        // ✅ The fixed version
        onData: ({ client, data }) => {
            const newTask = data.data?.taskCreated;
            if (!newTask) return;

            // 1. Get the current user from localStorage
            const storedUser = localStorage.getItem("user");
            const currentUser = storedUser ? JSON.parse(storedUser) : null;

            // 2. If the task was created by someone else, ignore it!
            if (currentUser && newTask.authorId !== currentUser.id) {
                return;
            }

            // 3. Proceed with the de-duplication and cache write
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

    useSubscription(TASK_UPDATED_SUBSCRIPTION, {
        variables: { projectId: DEFAULT_PROJECT_ID },
        onData: ({ client, data }) => {
            const updatedTask = data.data?.taskUpdated;
            if (!updatedTask) return;

            // Update Apollo cache — replace the task
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

    useSubscription(TASK_DELETED_SUBSCRIPTION, {
        variables: { projectId: DEFAULT_PROJECT_ID },
        onData: ({ client, data }) => {
            const deletedId = data.data?.taskDeleted;
            if (!deletedId) return;

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

            client.cache.gc(); // automatically evicts unreferenced Task:xxx entities
        },
    });

    const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS);

    const draggedTaskIdRef = useRef<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const tasks: Task[] = data?.tasks ?? [];

    const openCreateDialog = () => {
        setSelectedTask(null);
        setDialogOpen(true);
    };

    const openEditDialog = (task: Task) => {
        setSelectedTask(task);
        setDialogOpen(true);
    };

    const handleDragStart = (taskId: string) => {
        draggedTaskIdRef.current = taskId;
        setIsDragging(true);
    };

    const handleDrop = async (newStatus: TaskStatus) => {
        const taskId = draggedTaskIdRef.current;
        if (!taskId) return;

        try {
            await updateTaskStatus({
                variables: {
                    id: taskId,
                    input: { status: newStatus }, // ← status wrapped in `input`
                },
                optimisticResponse: {
                    updateTask: {
                        // ← must match the mutation field name exactly
                        __typename: "Task",
                        id: taskId,
                        status: newStatus,
                    },
                },
            });
            refetch();
        } catch (err) {
            console.error("Failed to move task:", err);
            refetch(); // ← roll back by refetching real state
        }

        draggedTaskIdRef.current = null;
        setIsDragging(false);
    };

    const handleDragEnd = () => {
        draggedTaskIdRef.current = null;
        setIsDragging(false);
    };

    const router = useRouter();

    return (
        <div onDragEnd={handleDragEnd}>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">
                        Task Board
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        {loading
                            ? "Loading..."
                            : `${tasks.length} task${tasks.length === 1 ? "" : "s"} total`}
                    </p>
                </div>
                <div>
                    <Button
                        className="py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                        onClick={openCreateDialog}
                    >
                        + New Task
                    </Button>
                    <Button className="py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 ml-2">
                        <Link href="/dashboard">Open Dashboard</Link>
                    </Button>
                    <Button
                        onClick={() => {
                            localStorage.removeItem("accessToken");
                            localStorage.removeItem("refreshToken");
                            router.push("/login");
                        }}
                        className="py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 ml-2"
                    >
                        Sign Out
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-md bg-red-950 p-3 text-sm text-red-400">
                    {error.message}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {COLUMNS.map((column) => (
                    <KanbanColumn
                        key={column.status}
                        status={column.status}
                        title={column.title}
                        color={column.color}
                        tasks={tasks.filter((t) => t.status === column.status)}
                        isDragging={isDragging}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                        onTaskClick={openEditDialog}
                    />
                ))}
            </div>

            <TaskDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                task={selectedTask}
                onSuccess={() => {
                    setDialogOpen(false);
                    setSelectedTask(null);
                }}
            />
        </div>
    );
}
