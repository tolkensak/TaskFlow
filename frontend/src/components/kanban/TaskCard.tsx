//src/components/kanban/TaskCard.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";

type TaskCardProps = Pick<Task, "title" | "description" | "priority" | "subtaskCount">;

const priorityColors: Record<Task["priority"], string> = {
  LOW: "bg-slate-500",
  MEDIUM: "bg-blue-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-600",
};

export function TaskCard({ title, description, priority, subtaskCount }: TaskCardProps) {
    return (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-3 shadow-sm hover:border-slate-500 transition-colors cursor-grab">
            <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium text-slate-100">{title}</h4>
                <Badge
                    className={cn(
                        "text-[10px] uppercase",
                        priorityColors[priority],
                    )}
                >
                    {priority}
                </Badge>
            </div>
            {description && (
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                    {description}
                </p>
            )}
            {subtaskCount !== undefined && subtaskCount > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                    <span>📋</span>
                    <span>{subtaskCount}</span>
                </div>
            )}
        </div>
    );
}
