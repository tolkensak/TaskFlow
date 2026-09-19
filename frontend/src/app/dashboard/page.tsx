// frontend/src/app/board/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { Loader2 } from "lucide-react";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import { GET_ME } from "@/graphql/queries/user";
import Link from "next/link";

const GET_TASKS = gql`
    query GetTasks($projectId: String) {
        tasks(projectId: $projectId) {
            id
            title
            description
            status
            priority
            dueDate
            createdAt
            author {
                id
                name
                email
            }
            assignments {
                id
                user {
                    id
                    name
                    email
                }
            }
        }
    }
`;

export default function BoardPage() {
    const router = useRouter();
    const {
        loading: userLoading,
        error: userError,
        data: userData,
    } = useQuery(GET_ME);

    const {
        loading: tasksLoading,
        error: tasksError,
        data: tasksData,
        refetch,
    } = useQuery(GET_TASKS, {
        variables: { projectId: "default-project" },
        skip: !userData?.me,
    });

    useEffect(() => {
        if (userError) {
            router.push("/login");
        }
    }, [userError, router]);

    if (userLoading || tasksLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <p className="mt-4 text-muted-foreground">
                        Loading your board...
                    </p>
                </div>
            </div>
        );
    }

    if (tasksError) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-destructive">
                        Error loading tasks: {tasksError.message}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b bg-background">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">TaskFlow</h1>
                        <p className="text-sm text-muted-foreground">
                            Welcome, {userData?.me?.name}!
                        </p>
                    </div>
                    <div>
                        <Link
                            href="/board"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
                        >
                            📋 Open Kanban Board
                        </Link>
                        <button
                            onClick={() => {
                                localStorage.removeItem("accessToken");
                                localStorage.removeItem("refreshToken");
                                router.push("/login");
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <KanbanBoard
                    tasks={tasksData?.tasks || []}
                    onTasksChange={refetch}
                />
            </main>
        </div>
    );
}
