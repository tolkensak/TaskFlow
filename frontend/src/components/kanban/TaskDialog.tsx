"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface TaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TaskDialog({ open, onOpenChange }: TaskDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Task</DialogTitle>
                    <DialogDescription>
                        Add a new task to your board
                    </DialogDescription>
                </DialogHeader>
                <div className="py-6 text-sm text-slate-400">
                    Task form coming next session...
                </div>
            </DialogContent>
        </Dialog>
    );
}
