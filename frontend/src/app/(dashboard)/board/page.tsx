// src/app/(dashboard)/board/page.tsx
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

export default function BoardPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <div className="container mx-auto px-6 py-8">
                <KanbanBoard />
            </div>
        </div>
    );
}
