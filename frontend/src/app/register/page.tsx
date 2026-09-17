// frontend/src/app/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@apollo/client";
import { REGISTER_MUTATION } from "@/graphql/mutations/auth";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const [register, { loading }] = useMutation(REGISTER_MUTATION, {
        onCompleted: (data) => {
            console.log("✅ Registration successful:", data);

            // ✅ Store tokens
            localStorage.setItem("accessToken", data.register.accessToken);
            localStorage.setItem("refreshToken", data.register.refreshToken);

            // ✅ Reliable redirect - works every time
            window.location.href = "/dashboard";
        },
        onError: (error) => {
            console.error("❌ Registration error:", error);
            setError(error.message || "Failed to register");
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await register({ variables: { input: { email, password, name } } });
        } catch (err) {
            console.error("❌ Submit error:", err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-6">
                    Create Account
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="John Doe"
                        />
                    </div>
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
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                            autoComplete="new-password"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <p className="text-center text-sm mt-4 text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="text-blue-600 hover:underline"
                    >
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
