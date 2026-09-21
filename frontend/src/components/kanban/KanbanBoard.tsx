// src/components/kanban/KanbanBoard.tsx
"use client";

import { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from "./KanbanColumn";
import { TaskDialog } from "./TaskDialog";

const UPDATE_TASK_STATUS = gql`
    mutation UpdateTaskStatus($id: String!, $input: UpdateTaskInput!) {
        updateTask(id: $id, input: $input) {
            id
            status
        }
    }
`;

const TASK_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

const STATUS_LABELS = {
    TODO: { title: "📋 To Do", color: "bg-slate-100 dark:bg-slate-800" },
    IN_PROGRESS: {
        title: "🚧 In Progress",
        color: "bg-blue-50 dark:bg-blue-950",
    },
    REVIEW: { title: "👀 Review", color: "bg-yellow-50 dark:bg-yellow-950" },
    DONE: { title: "✅ Done", color: "bg-green-50 dark:bg-green-950" },
};

interface Task {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate?: string;
    author: { id: string; name: string; email: string };
    assignments: Array<{
        id: string;
        user: { id: string; name: string; email: string };
    }>;
}

interface KanbanBoardProps {
    tasks: Task[];
    onTasksChange?: () => void;
}

export default function KanbanBoard({
    tasks,
    onTasksChange,
}: KanbanBoardProps) {
    const [draggedTask, setDraggedTask] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS, {
        onCompleted: () => {
            toast.success("Task moved!");
            onTasksChange?.();
        },
        onError: (error) => {
            toast.error(`Failed to move task: ${error.message}`);
        },
    });

    /**
     * Group tasks by status
     */
    const tasksByStatus = TASK_STATUSES.reduce(
        (acc, status) => {
            acc[status] = tasks.filter((task) => task.status === status);
            return acc;
        },
        {} as Record<string, Task[]>,
    );

    /**
     * Handle drag start
     */
    const handleDragStart = (taskId: string) => {
        setDraggedTask(taskId);
    };

    /**
     * Handle drop on a column
     */
    const handleDrop = async (newStatus: string) => {
        if (!draggedTask) return;

        const task = tasks.find((t) => t.id === draggedTask);
        if (!task || task.status === newStatus) {
            setDraggedTask(null);
            return;
        }

        try {
            await updateTaskStatus({
                variables: {
                    id: draggedTask,
                    input: { status: newStatus },
                },
            });
        } finally {
            setDraggedTask(null);
        }
    };

    /**
     * Handle task click (open dialog)
     */
    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setDialogOpen(true);
    };

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold">Task Board</h2>
                    <p className="text-sm text-muted-foreground">
                        {tasks.length} task{tasks.length === 1 ? "" : "s"} total
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setSelectedTask(null);
                        setDialogOpen(true);
                    }}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {TASK_STATUSES.map((status) => (
                    <KanbanColumn
                        key={status}
                        status={status}
                        title={
                            STATUS_LABELS[status as keyof typeof STATUS_LABELS]
                                .title
                        }
                        color={
                            STATUS_LABELS[status as keyof typeof STATUS_LABELS]
                                .color
                        }
                        tasks={tasksByStatus[status] || []}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                        onTaskClick={handleTaskClick}
                        isDragging={!!draggedTask}
                    />
                ))}
            </div>

            <TaskDialog
                task={selectedTask}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={onTasksChange}
            />
        </>
    );
}
