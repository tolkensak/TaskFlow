// frontend/src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_ME } from "@/graphql/queries/user";

export default function DashboardPage() {
    const [isLoaded, setIsLoaded] = useState(false);

    const { loading, error, data } = useQuery(GET_ME, {
        fetchPolicy: "network-only",
    });

    useEffect(() => {
        // ✅ Check token
        const token =
            typeof window !== "undefined"
                ? localStorage.getItem("accessToken")
                : null;
        if (!token && !loading) {
            window.location.href = "/login";
            return;
        }

        // ✅ Handle errors
        if (error) {
            console.error("❌ Dashboard error:", error);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
        }

        // ✅ Mark as loaded
        if (data?.me && !loading) {
            setIsLoaded(true);
        }
    }, [error, loading, data]);

    // ✅ Log when component renders
    console.log(
        "🔄 Dashboard rendered, loading:",
        loading,
        "isLoaded:",
        isLoaded,
    );

    if (loading || !isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Loading your dashboard...
                    </p>
                </div>
            </div>
        );
    }

    if (!data?.me) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Unable to load user data
                    </p>
                    <button
                        onClick={() => (window.location.href = "/login")}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    const user = data.me;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <nav className="bg-white dark:bg-gray-800 shadow p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">TaskFlow</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700 dark:text-gray-300">
                            Welcome, {user.name}!
                        </span>
                        <button
                            onClick={() => {
                                localStorage.removeItem("accessToken");
                                localStorage.removeItem("refreshToken");
                                window.location.href = "/login";
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Welcome to TaskFlow!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        You are logged in as: <strong>{user.email}</strong>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                        User ID:{" "}
                        <span className="font-mono text-sm">{user.id}</span>
                    </p>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-2">Projects</h3>
                        <p className="text-3xl font-bold text-blue-600">0</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-2">Tasks</h3>
                        <p className="text-3xl font-bold text-green-600">0</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-2">
                            Team Members
                        </h3>
                        <p className="text-3xl font-bold text-purple-600">0</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
