"use client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex">
        {/* Sidebar on the left */}
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 p-6 bg-gray-800 text-white min-h-screen">
          {children}
        </main>
      </div>
    </DndProvider>
  );
}
