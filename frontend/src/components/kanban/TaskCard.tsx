// src/components/kanban/TaskCard.tsx
"use client";

import { Calendar, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

interface TaskCardProps {
    task: Task;
    onDragStart: (taskId: string) => void;
    onClick: () => void;
}

const PRIORITY_COLORS = {
    LOW: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
    MEDIUM: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    URGENT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function TaskCard({
    task,
    onDragStart,
    onClick,
}: TaskCardProps) {
    return (
        <div
            draggable
            onDragStart={() => onDragStart(task.id)}
            onClick={onClick}
            className={`
        bg-background p-3 rounded-md border shadow-sm cursor-move
        hover:shadow-md transition-all
      `}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-medium text-sm line-clamp-2">
                    {task.title}
                </h4>
                <Badge
                    className={`text-xs shrink-0 ${PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}`}
                >
                    {task.priority}
                </Badge>
            </div>

            {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {task.description}
                </p>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
                {task.dueDate && (
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                )}

                {task.assignments && task.assignments.length > 0 && (
                    <div className="flex items-center gap-1">
                        <UserIcon className="h-3 w-3" />
                        {task.assignments.length}
                    </div>
                )}
            </div>
        </div>
    );
}
