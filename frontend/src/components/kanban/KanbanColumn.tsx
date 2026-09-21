"use client";

import { TaskCard } from "./TaskCard";

interface Task {
    id: string;
    title: string;
    description?: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    subtaskCount?: number;
}

interface KanbanColumnProps {
    title: string;
    icon: string;
    tasks: Task[];
    accent: string;
}

export function KanbanColumn({
    title,
    icon,
    tasks,
    accent,
}: KanbanColumnProps) {
    return (
        <div
            className={cn("flex flex-col rounded-lg p-4 min-h-[400px]", accent)}
        >
            <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <span>{icon}</span>
                    {title}
                </h3>
                <span className="text-xs text-slate-400">{tasks.length}</span>
            </div>
            <div className="flex flex-col gap-2">
                {tasks.length === 0 ? (
                    <p className="py-8 text-center text-xs text-slate-500">
                        No tasks here
                    </p>
                ) : (
                    tasks.map((task) => <TaskCard key={task.id} {...task} />)
                )}
            </div>
        </div>
    );
}

// (add this import at the top)
import { cn } from "@/lib/utils";
