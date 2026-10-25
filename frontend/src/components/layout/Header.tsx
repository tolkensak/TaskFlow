"use client";

import { useEffect, useState } from "react";
import { useApolloClient } from "@apollo/client";

export function Header() {
    const [user, setUser] = useState<{ name: string } | null>(null);
    const client = useApolloClient();

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // ✅ Clear the Apollo cache so the next user doesn't see the previous user's data
        client.clearStore().then(() => {
            window.location.href = "/login"; // Force a hard redirect
        });
    };

    return (
        <header className="...">
            <h1>TaskFlow</h1>
            <p>Welcome, {user?.name ?? "Guest"}!</p>
            {/* ... */}
        </header>
    );
}
