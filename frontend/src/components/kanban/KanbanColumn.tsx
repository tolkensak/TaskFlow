"use client";

import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types/task";
import { TaskCard } from "./TaskCard";

interface KanbanColumnProps {
    status: TaskStatus;
    title: string;
    color: string; // tailwind bg class for the column, e.g. "bg-slate-900"
    tasks: Task[];
    isDragging: boolean;
    onDragStart: (taskId: string) => void;
    onDrop: (newStatus: TaskStatus) => void;
    onTaskClick: (task: Task) => void;
}

export function KanbanColumn({
    status,
    title,
    color,
    tasks,
    isDragging,
    onDragStart,
    onDrop,
    onTaskClick,
}: KanbanColumnProps) {
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // required to allow drop
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        onDrop(status);
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
                "flex flex-col rounded-lg p-4 min-h-[500px] transition-colors",
                color,
                isDragging && "ring-2 ring-blue-500/50",
            )}
        >
            <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                    {title}
                </h3>
                <span className="text-xs text-slate-400">{tasks.length}</span>
            </div>

            <div className="flex flex-1 flex-col gap-2">
                {tasks.length === 0 ? (
                    <p className="py-8 text-center text-xs text-slate-500">
                        {isDragging ? "Drop here" : "No tasks here"}
                    </p>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            draggable
                            onDragStart={() => onDragStart(task.id)}
                            onClick={() => onTaskClick(task)}
                            className="cursor-grab active:cursor-grabbing"
                        >
                            <TaskCard
                                title={task.title}
                                description={task.description}
                                priority={task.priority}
                                subtaskCount={task.subtaskCount}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
