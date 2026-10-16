// src/app/(dashboard)/board/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

export default function BoardPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <div className="container mx-auto px-6 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/dashboard">
                        <Button variant="outline" size="sm">
                            ← Back to Dashboard
                        </Button>
                    </Link>
                </div>
                <KanbanBoard />
            </div>
        </div>
    );
}
