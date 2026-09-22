// src/components/kanban/KanbanBoard.tsx
"use client";

import { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from "./KanbanColumn";
import { TaskDialog } from "./TaskDialog";
import type { Task, TaskStatus } from "@/types/task";

const columns: { status: TaskStatus; title: string; color: string }[] = [
    { status: "TODO", title: "📋 To Do", color: "bg-slate-900" },
    { status: "IN_PROGRESS", title: "🚧 In Progress", color: "bg-blue-950" },
    { status: "REVIEW", title: "👀 Review", color: "bg-amber-950" },
    { status: "DONE", title: "✅ Done", color: "bg-green-950" },
];

const UPDATE_TASK_STATUS = gql`
    mutation UpdateTaskStatus($id: String!, $input: UpdateTaskInput!) {
        updateTask(id: $id, input: $input) {
            id
            status
        }
    }
`;

const TASK_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

interface KanbanBoardProps {
    tasks: Task[];
    onTasksChange?: () => void;
}

export default function KanbanBoard({
    tasks,
    onTasksChange,
}: KanbanBoardProps) {
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
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
        setDraggedTaskId(taskId);
    };

    /**
     * Handle drop on a column
     */
    const handleDrop = async (newStatus: string) => {
        if (!draggedTaskId) return;

        const task = tasks.find((t) => t.id === draggedTaskId);
        if (!task || task.status === newStatus) {
            setDraggedTaskId(null);
            return;
        }

        try {
            await updateTaskStatus({
                variables: {
                    id: draggedTaskId,
                    input: { status: newStatus },
                },
            });
        } finally {
            setDraggedTaskId(null);
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
                {columns.map((column) => (
                    <KanbanColumn
                        key={column.status}
                        status={column.status}
                        title={column.title}
                        color={column.color}
                        tasks={tasks}
                        isDragging={draggedTaskId !== null}
                        onDragStart={(taskId) => setDraggedTaskId(taskId)}
                        onDrop={handleDrop}
                        onTaskClick={(task) => {
                            setSelectedTask(task);
                            setDialogOpen(true);
                        }}
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
