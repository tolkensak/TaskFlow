// frontend/src/app/page.tsx

import Link from "next/link";

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-2xl mx-auto text-center px-4">
                <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                    TaskFlow
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                    Real-time collaborative task management for modern teams
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/login"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/register"
                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
                    >
                        Create Account
                    </Link>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <h3 className="font-semibold mb-2">📋 Projects</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Organize your work
                        </p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <h3 className="font-semibold mb-2">✅ Tasks</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Track progress
                        </p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <h3 className="font-semibold mb-2">👥 Teams</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Collaborate seamlessly
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
