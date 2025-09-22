"use client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Sidebar from "./components/Sidebar";
import MainDropZone from "./components/MainDropZone";

export default function Page() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-4">
          <MainDropZone />
        </div>
      </div>
    </DndProvider>
  );
}
