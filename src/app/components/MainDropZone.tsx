"use client";
import { useRef, useState } from "react";
import { useDrop } from "react-dnd";
import DraggableBox from "./DraggableBox";
import type { DndItem } from "./types";

type DroppedItem = {
  id: number;
  name: string;
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
    drop: (item, monitor) => {
      if (item.type === "SIDEBAR_ITEM") {
        const offset = monitor.getClientOffset();
        const rect = dropRef.current?.getBoundingClientRect();

        if (offset && rect) {
          const left = offset.x - rect.left;
          const top = offset.y - rect.top;
          setItems((prev) => [
            ...prev,
            { id: Date.now(), name: item.name, left, top },
          ]);
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
