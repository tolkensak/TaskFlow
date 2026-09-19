// src/components/kanban/KanbanColumn.tsx
"use client";

import { useState } from "react";
import TaskCard from "./TaskCard";

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

interface KanbanColumnProps {
    status: string;
    title: string;
    color: string;
    tasks: Task[];
    onDragStart: (taskId: string) => void;
    onDrop: (status: string) => void;
    onTaskClick: (task: Task) => void;
    isDragging: boolean;
}

export default function KanbanColumn({
    status,
    title,
    color,
    tasks,
    onDragStart,
    onDrop,
    onTaskClick,
    isDragging,
}: KanbanColumnProps) {
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = () => {
        setIsOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(false);
        onDrop(status);
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
        rounded-lg p-4 min-h-[500px] transition-all
        ${color}
        ${isOver && isDragging ? "ring-2 ring-primary ring-offset-2" : ""}
      `}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">{title}</h3>
                <span className="text-xs bg-background/50 px-2 py-1 rounded">
                    {tasks.length}
                </span>
            </div>

            <div className="space-y-2">
                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onDragStart={onDragStart}
                        onClick={() => onTaskClick(task)}
                    />
                ))}

                {tasks.length === 0 && (
                    <div className="text-center py-8 text-xs text-muted-foreground">
                        No tasks here
                    </div>
                )}
            </div>
        </div>
    );
}
