"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    CREATE_TASK,
    UPDATE_TASK,
    DELETE_TASK,
    GET_TASKS,
} from "@/lib/graphql/tasks";
import { DEFAULT_PROJECT_ID } from "@/lib/constants";
import type { Task, TaskStatus, TaskPriority } from "@/types/task";

interface TaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task?: Task | null;
    onSuccess?: () => void;
}

export function TaskDialog({
    open,
    onOpenChange,
    task,
    onSuccess,
}: TaskDialogProps) {
    const isEditing = !!task;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
    const [status, setStatus] = useState<TaskStatus>("TODO");
    const [error, setError] = useState<string | null>(null);

    // Reset form whenever the dialog opens (or a different task is selected)
    useEffect(() => {
        if (!open) return;
        setTitle(task?.title ?? "");
        setDescription(task?.description ?? "");
        setPriority(task?.priority ?? "MEDIUM");
        setStatus(task?.status ?? "TODO");
        setError(null);
    }, [open, task]);

    const [createTask, { loading: creating }] = useMutation(CREATE_TASK, {
        onCompleted: () => {
            onSuccess?.();
        },
        onError: (err) => {
            setError(err.message);
        },
    });

    const [updateTask, { loading: updating }] = useMutation(UPDATE_TASK, {
        onCompleted: () => onSuccess?.(),
        onError: (err) => setError(err.message),
    });

    const [deleteTask, { loading: deleting }] = useMutation(DELETE_TASK, {
        onCompleted: () => onSuccess?.(),
        onError: (err) => setError(err.message),
        refetchQueries: [
            { query: GET_TASKS, variables: { projectId: DEFAULT_PROJECT_ID } },
        ],
        awaitRefetchQueries: true,
    });

    const isLoading = creating || updating || deleting;

    const handleDelete = async () => {
        if (!task) return;
        if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`))
            return;

        await deleteTask({ variables: { id: task.id } });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        if (isEditing && task) {
            // EDIT MODE
            await updateTask({
                variables: {
                    id: task.id,
                    input: {
                        title: title.trim(),
                        description: description.trim() || undefined,
                        priority,
                        status,
                    },
                },
            });
        } else {
            // CREATE MODE
            await createTask({
                variables: {
                    input: {
                        title: title.trim(),
                        description: description.trim() || undefined,
                        priority,
                        status,
                        projectId: DEFAULT_PROJECT_ID,
                    },
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Task" : "Create Task"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update your task details"
                            : "Add a new task to your board"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="rounded-md bg-red-950 p-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What needs to be done?"
                            required
                            autoFocus
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add more details (optional)"
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                                value={priority}
                                onValueChange={(v) =>
                                    setPriority(v as TaskPriority)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="MEDIUM">
                                        Medium
                                    </SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="URGENT">
                                        Urgent
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={status}
                                onValueChange={(v) =>
                                    setStatus(v as TaskStatus)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TODO">To Do</SelectItem>
                                    <SelectItem value="IN_PROGRESS">
                                        In Progress
                                    </SelectItem>
                                    <SelectItem value="REVIEW">
                                        Review
                                    </SelectItem>
                                    <SelectItem value="DONE">Done</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-between gap-2 pt-2">
                        {isEditing && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isLoading}
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </Button>
                        )}
                        <div className="ml-auto flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading
                                    ? isEditing
                                        ? "Saving..."
                                        : "Creating..."
                                    : isEditing
                                      ? "Save Changes"
                                      : "Create Task"}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
