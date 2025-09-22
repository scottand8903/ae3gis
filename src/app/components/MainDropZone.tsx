"use client";
import { useDrop } from "react-dnd"; // pnm add react-dnd react-dnd-html5-backend
import { useState } from "react";
import { useRef } from "react";

type DroppedItem = {
  id: number;
  name: string;
  left: number;
  top: number;
};

//   const [{ isOver }, drop] = useDrop(() => ({
//     accept: "SIDEBAR_ITEM",
//     drop: (item: { name: string }) => {
//       setItems((prev) => [...prev, item.name]); // add item to state
//     },
//     collect: (monitor) => ({
//       isOver: monitor.isOver(),
//     }),
//   }));

export default function MainDropZone() {
  const [items, setItems] = useState<DroppedItem[]>([]);
  const ref = useRef<HTMLDivElement | null>(null);
  let idCounter = items.length; // simple id generator

  const [, drop] = useDrop(() => ({
    accept: "SIDEBAR_ITEM",
    drop: (item: { name: string }, monitor) => {
      const clientOffset = monitor.getClientOffset(); // mouse position on screen
      const dropTarget = ref.current?.getBoundingClientRect();

      if (clientOffset && dropTarget) {
        const left = clientOffset.x - dropTarget.left;
        const top = clientOffset.y - dropTarget.top;

        setItems((prev) => [
          ...prev,
          { id: idCounter++, name: item.name, left, top },
        ]);
      }
    },
  }));

  drop(ref); // attach drop to the ref

  return (
    // <div
    //   ref={ref}
    //   className={`min-h-[800px] border-2 rounded p-4 ${
    //     isOver ? "bg-gray-500" : "bg-gray-600"
    //   }`}
    // >
    <div
      ref={ref}
      className="relative min-h-[600px] border-2 rounded p-4 bg-gray-600"
    >
      <h2 className="font-bold mb-4">Drop Items Anywhere</h2>
      {/* <ul className="space-y-2"> */}
      {/* <ul className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <li key={idx} className="p-2 bg-gray-400 rounded">
            {item}
          </li>
        ))}
      </ul> */}

      {items.map((item) => (
        <div
          key={item.id}
          className="absolute p-2 bg-gray-400 rounded cursor-move"
          style={{ left: item.left, top: item.top }}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}
