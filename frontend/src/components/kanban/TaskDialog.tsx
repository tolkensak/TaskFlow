//src/components/kanban/TaskDialog.tsx
"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { Task } from "@/types/task";

interface TaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task?: Task | null; // ← add this
    onSuccess?: () => void; // ← add this too (KanbanBoard passes it)
}

export function TaskDialog({
    open,
    onOpenChange,
    task,
    onSuccess,
}: TaskDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {task ? "Edit Task" : "Create Task"}
                    </DialogTitle>
                    <DialogDescription>
                        {task
                            ? "Update your task details"
                            : "Add a new task to your board"}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-6 text-sm text-slate-400">
                    {task
                        ? "Edit form coming next session..."
                        : "Task form coming next session..."}
                </div>
            </DialogContent>
        </Dialog>
    );
}
