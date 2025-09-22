"use client"; // needed in Next.js App Router
import { useDrag, useDrop } from "react-dnd";

type DraggableBoxProps = {
  id: number;
  name: string;
  left: number;
  top: number;
  moveBox: (id: number, left: number, top: number) => void;
};

export default function DraggableBox({
  id,
  name,
  left,
  top,
  moveBox,
}: DraggableBoxProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "DROPPED_ITEM",
    item: { id, left, top },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const offset = monitor.getSourceClientOffset();
      if (offset) {
        moveBox(item.id, offset.x, offset.y);
      }
    },
  }));

  const [, drop] = useDrop(() => ({
    accept: "DROPPED_ITEM",
    hover(item: { id: number; left: number; top: number }, monitor) {
      if (item.id !== id) {
        return;
      }

      const delta = monitor.getDifferenceFromInitialOffset();
      if (!delta) {
        return;
      }

      const newLeft = Math.round(item.left + delta.x);
      const newTop = Math.round(item.top + delta.y);

      moveBox(item.id, newLeft, newTop);

      // Update the item's position to prevent jittering
      item.left = newLeft;
      item.top = newTop;
    },
  }));

  return (
    <div
      ref={(node) => {
        if (node) drag(drop(node));
      }}
      className={`absolute p-2 bg-blue-500 text-white rounded cursor-move ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      style={{ left, top }}
    >
      {name}
    </div>
  );
}
