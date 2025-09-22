"use client";
import { useDrop } from "react-dnd"; // pnm add react-dnd react-dnd-html5-backend
import { useState } from "react";
import { useRef } from "react";
import DraggableBox from "./DraggableBox";

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
  const dropRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<DroppedItem[]>([]);
  const ref = useRef<HTMLDivElement | null>(null);
  let idCounter = items.length; // simple id generator

  const moveItem = (id: number, left: number, top: number) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, left, top } : item))
    );
  };

  const [, drop] = useDrop(() => ({
    accept: ["SIDEBAR_ITEM", "DROPPED_ITEM"], // accept both types
    drop: (item: any, monitor) => {
      const clientOffset = monitor.getSourceClientOffset(); // mouse position on screen
      const dropZoneRect = dropRef.current?.getBoundingClientRect();

      if (clientOffset && dropZoneRect) {
        const left = clientOffset.x - dropZoneRect.left;
        const top = clientOffset.y - dropZoneRect.top;

        if (item.type === "SIDEBAR_ITEM") {
          // new item from sidebar
          setItems((prev) => [
            ...prev,
            { id: idCounter++, name: item.name, left, top },
          ]);
        } else if (item.type === "DROPPED_ITEM") {
          // existing item being moved
          moveItem(item.id, left, top);
        }
      }
    },
  }));

  drop(dropRef); // attach drop to the ref

  return (
    // <div
    //   ref={ref}
    //   className={`min-h-[800px] border-2 rounded p-4 ${
    //     isOver ? "bg-gray-500" : "bg-gray-600"
    //   }`}
    // >
    <div
      ref={dropRef}
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
        <DraggableBox
          key={item.id}
          id={item.id}
          name={item.name}
          left={item.left}
          top={item.top}
          moveBox={moveItem}
        />

        // DraggableBox component handles this now
        // <div
        //   key={item.id}
        //   className="absolute p-2 bg-gray-400 rounded cursor-move"
        //   style={{ left: item.left, top: item.top }}
        // >
        //   {item.name}
        // </div>
      ))}
    </div>
  );
}
