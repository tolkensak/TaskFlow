// frontend/src/app/login/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import { LOGIN_MUTATION } from "@/graphql/mutations/auth";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const [login, { loading }] = useMutation(LOGIN_MUTATION, {
        onCompleted: (data) => {
            console.log("✅ Login successful:", data);
            localStorage.setItem("accessToken", data.login.accessToken);
            localStorage.setItem("refreshToken", data.login.refreshToken);
            // ✅ Use replace instead of push to prevent back navigation issues
            router.replace("/dashboard");
        },
        onError: (error) => {
            console.error("❌ Login error:", error);
            setError(error.message || "Failed to login");
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await login({ variables: { input: { email, password } } });
        } catch (err) {
            console.error("❌ Submit error:", err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-6">Sign In</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="you@example.com"
                            autoComplete="email"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-sm mt-4 text-gray-600 dark:text-gray-400">
                    Don't have an account?{" "}
                    <Link
                        href="/register"
                        className="text-blue-600 hover:underline"
                    >
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
