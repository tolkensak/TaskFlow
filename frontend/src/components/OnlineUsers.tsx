// frontend/src/components/OnlineUsers.tsx
"use client";

import { usePresence } from "@/hooks/usePresence";

interface OnlineUsersProps {
    userId: string;
    username: string;
    currentUserId?: string;
}

export default function OnlineUsers({
    userId,
    username,
    currentUserId,
}: OnlineUsersProps) {
    const { onlineUsers, isConnected } = usePresence(userId, username);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    👥 Online
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
                </span>
            </div>

            {onlineUsers.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">
                    No one else is online
                </p>
            ) : (
                <ul className="space-y-2">
                    {onlineUsers.map((user) => (
                        <li
                            key={user.userId}
                            className="flex items-center gap-2"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {user.username}
                                {user.userId === currentUserId && " (You)"}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
