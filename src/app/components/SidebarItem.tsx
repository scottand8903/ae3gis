"use client";
import { useDrag } from "react-dnd";
import { useRef } from "react"; // import useRef

export default function SidebarItem({ name }: { name: string }) {
  const ref = useRef<HTMLDivElement>(null); // create a ref for the div
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "SIDEBAR_ITEM",
    item: { name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  drag(ref); // attach drag to the ref

  return (
    <div
      ref={ref} // attach the ref to the div
      className={`p-2 rounded cursor-move ${
        isDragging ? "opacity-50" : "opacity-100"
      } hover:bg-gray-700`}
    >
      {name}
    </div>
  );
}
