"use client";
import { useDrag, useDrop } from "react-dnd";
import { useRef } from "react";

type DraggableBoxProps = {
  id: number;
  name: string;
  left: number;
  top: number;
  moveBox: (id: number, left: number, top: number) => void;
  dropZoneRef: React.RefObject<HTMLDivElement | null>;
};

export default function DraggableBox({
  id,
  name,
  left,
  top,
  moveBox,
  dropZoneRef,
}: DraggableBoxProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "BOX",
    item: { id, left, top, name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: "BOX",
    hover(item: { id: number; left: number; top: number }, monitor) {
      if (item.id !== id) return;

      const offset = monitor.getSourceClientOffset();
      const rect = dropZoneRef.current?.getBoundingClientRect();

      if (offset && rect) {
        const newLeft = offset.x - rect.left;
        const newTop = offset.y - rect.top;
        moveBox(item.id, newLeft, newTop);

        // keep item position updated (prevents jitter)
        item.left = newLeft;
        item.top = newTop;
      }
    },
  }));

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`absolute p-2 bg-blue-500 text-white rounded cursor-move ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      style={{ left, top }}
    >
      {name}
    </div>
  );
}
