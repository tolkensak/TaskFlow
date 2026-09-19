// src/components/kanban/TaskDialog.tsx
"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface TaskDialogProps {
    task: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function TaskDialog({
    task,
    open,
    onOpenChange,
    onSuccess,
}: TaskDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {task ? "Edit Task" : "Create Task"}
                    </DialogTitle>
                    <DialogDescription>
                        {task
                            ? "Update task details"
                            : "Add a new task to your board"}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                        Task form coming next session...
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
