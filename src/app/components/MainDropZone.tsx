"use client";
import { useRef, useState } from "react";
import { useDrop } from "react-dnd";
import DraggableBox from "./DraggableBox";
import type { DndItem } from "./types";

type DroppedItem = {
  id: number;
  name: string;
  templateId: string;
  left: number;
  top: number;
};

export default function MainDropZone() {
  const dropRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<DroppedItem[]>([]);

  const moveBox = (id: number, left: number, top: number) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, left, top } : it))
    );
  };

  const [, drop] = useDrop<DndItem>(() => ({
    accept: ["SIDEBAR_ITEM", "BOX"],
    drop: async (item, monitor) => {
      if (item.type === "SIDEBAR_ITEM") {
        const offset = monitor.getClientOffset();
        const rect = dropRef.current?.getBoundingClientRect();

        if (offset && rect) {
          const left = offset.x - rect.left;
          const top = offset.y - rect.top;

          // Add locally so you see it right away
          const newItem = {
            id: Date.now(),
            name: item.name,
            templateId: item.templateId,
            left,
            top,
          };
          setItems((prev) => [...prev, newItem]);

          try {
            const projectId = "391a9fde-246c-4473-9024-202ff316c48a"; // replace with actual project ID

            const response = await fetch("/api/gns3/spawn-nodes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                projectId: projectId,
                templateId: item.templateId,
                x: left,
                y: top,
                name: item.name,
              }),
            });
            // const data = await response.json();
            // console.log("Project ID @:", projectId);
            // console.log("Template ID @:", item.templateId);
          } catch (err) {
            console.error("Error spawning node:", err);
          }
        }
      }
    },
  }));

  drop(dropRef); // attach drop behavior to the ref

  return (
    <div
      ref={dropRef}
      className="relative min-h-[900px] border-2 rounded bg-gray-700"
    >
      <h2 className="font-bold p-2">Drop Items Here</h2>
      {items.map((item) => (
        <DraggableBox
          key={item.id}
          id={item.id}
          name={item.name}
          left={item.left}
          top={item.top}
          moveBox={moveBox}
          dropZoneRef={dropRef}
        />
      ))}
    </div>
  );
}
