"use client";

import Link from "next/link";
import { useQuery } from "@apollo/client";
import { GET_TASKS } from "@/lib/graphql/tasks";
import { Button } from "@/components/ui/button";
import type { Task } from "@/types/task";
import { useTaskSubscriptions } from "@/hooks/useTaskSubscriptions";
import { useRouter } from "next/navigation";
import { GET_ME } from "@/graphql/queries/user";

export default function DashboardPage() {
    useTaskSubscriptions();

    const router = useRouter();
    const {
        loading: userLoading,
        error: userError,
        data: userData,
    } = useQuery(GET_ME);

    const { data, loading } = useQuery(GET_TASKS, {
        fetchPolicy: "cache-and-network", // ← always fresh, but instant from cache
    });

    const tasks: Task[] = data?.tasks ?? [];

    const stats = [
        { label: "Total Tasks", value: tasks.length, color: "text-slate-100" },
        {
            label: "In Progress",
            value: tasks.filter((t) => t.status === "IN_PROGRESS").length,
            color: "text-blue-400",
        },
        {
            label: "Review",
            value: tasks.filter((t) => t.status === "REVIEW").length,
            color: "text-amber-400",
        },
        {
            label: "Done",
            value: tasks.filter((t) => t.status === "DONE").length,
            color: "text-green-400",
        },
    ];

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="container mx-auto px-6 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100">
                            Welcome back, {userData?.me?.name}!
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Here&apos;s what&apos;s happening in your workspace
                        </p>
                    </div>
                    <div>
                        <Button className="py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                            <Link href="/board">Open Kanban Board</Link>
                        </Button>
                        <Button
                            onClick={() => {
                                localStorage.removeItem("accessToken");
                                localStorage.removeItem("refreshToken");
                                router.push("/login");
                            }}
                            className="py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 ml-2"
                        >
                            Sign Out
                        </Button>
                    </div>
                </div>
                {loading && !data ? (
                    <p className="text-slate-400">Loading stats...</p>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-lg border border-slate-800 bg-slate-900 p-4"
                            >
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                    {stat.label}
                                </p>
                                <p
                                    className={`mt-2 text-2xl font-bold ${stat.color}`}
                                >
                                    {stat.value}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900 p-6">
                    <h2 className="text-lg font-semibold text-slate-100">
                        Recent Activity
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Activity feed coming soon — powered by GraphQL
                        subscriptions.
                    </p>
                </div>
            </div>
        </div>
    );
}
