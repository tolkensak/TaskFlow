"use client";

import { useQuery, useMutation, useSubscription, gql } from "@apollo/client";
import { useRef, useState } from "react";
import type { Task, TaskStatus } from "@/types/task";
import { GET_TASKS, UPDATE_TASK_STATUS } from "@/lib/graphql/tasks";
import { KanbanColumn } from "./KanbanColumn";
import { TaskDialog } from "./TaskDialog";
import { DEFAULT_PROJECT_ID } from "@/lib/constants";

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
    }
  }
`;

export function KanbanBoard() {
  const { data, loading, error, refetch } = useQuery(GET_TASKS, {
    variables: { projectId: DEFAULT_PROJECT_ID },
    fetchPolicy: "cache-and-network",
  });

console.log("Board tasks:", data?.tasks?.length, data?.tasks);

  useSubscription(TASK_CREATED_SUBSCRIPTION, {
    variables: { projectId: DEFAULT_PROJECT_ID },
    onData: ({ client, data }) => {
      const newTask = data.data?.taskCreated;
      if (!newTask) return;

      // Update Apollo cache — add to the list
      const existing = client.readQuery({ query: GET_TASKS, variables: { projectId: DEFAULT_PROJECT_ID } });
      if (existing) {
        client.writeQuery({
          query: GET_TASKS,
          variables: { projectId: DEFAULT_PROJECT_ID },
          data: { tasks: [...existing.tasks, newTask] },
        });
      }
    },
  });

  useSubscription(TASK_UPDATED_SUBSCRIPTION, {
    variables: { projectId: DEFAULT_PROJECT_ID },
    onData: ({ client, data }) => {
      const updatedTask = data.data?.taskUpdated;
      if (!updatedTask) return;

      // Update Apollo cache — replace the task
      const existing = client.readQuery({ query: GET_TASKS, variables: { projectId: DEFAULT_PROJECT_ID } });
      if (existing) {
        client.writeQuery({
          query: GET_TASKS,
          variables: { projectId: DEFAULT_PROJECT_ID },
          data: {
            tasks: existing.tasks.map((t: any) =>
              t.id === updatedTask.id ? updatedTask : t
            ),
          },
        });
      }
    },
  });

  const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS);

  const draggedTaskIdRef = useRef<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const tasks: Task[] = data?.tasks ?? [];

  if (loading && !data) return <p className="text-slate-400">Loading tasks...</p>;
  if (error) return <p className="text-red-400">Error: {error.message}</p>;

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
            input: { status: newStatus },   // ← status wrapped in `input`
        },
        optimisticResponse: {
            updateTask: {                    // ← must match the mutation field name exactly
            __typename: "Task",
            id: taskId,
            status: newStatus,
            },
        },
        });
      refetch();
    } catch (err) {
      console.error("Failed to move task:", err);
      refetch();   // ← roll back by refetching real state
    }

    draggedTaskIdRef.current = null;
    setIsDragging(false);
  };

  const handleDragEnd = () => {
    draggedTaskIdRef.current = null;
    setIsDragging(false);
  };

  return (
    <div onDragEnd={handleDragEnd}>
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
            onTaskClick={(task) => {
              setSelectedTask(task);
              setDialogOpen(true);
            }}
          />
        ))}
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={selectedTask}
        onSuccess={() => {
          setDialogOpen(false);
          refetch();
        }}
      />
    </div>
  );
}