"use client";

import { useEffect, useState } from "react";

export function Header() {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <header className="...">
      <h1>TaskFlow</h1>
      <p>Welcome, {user?.name ?? "Guest"}!</p>
      {/* ... */}
    </header>
  );
}