// src/app/(dashboard)/board/page.tsx
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

export default function BoardPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100">Task Board</h1>
          <p className="text-sm text-slate-400">Drag tasks between columns</p>
        </div>
        <KanbanBoard />
      </div>
    </div>
  );
}