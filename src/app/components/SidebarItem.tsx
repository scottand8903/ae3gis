"use client";
import { useDrag } from "react-dnd";
import type { SidebarItem as SidebarItemType } from "./types";

type Props = { name: string };

export default function SidebarItem({ name }: Props) {
  const [{ isDragging }, drag] = useDrag<
    SidebarItemType,
    void,
    { isDragging: boolean }
  >(() => ({
    type: "SIDEBAR_ITEM",
    item: { type: "SIDEBAR_ITEM", name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={(node) => {
        if (node) drag(node);
      }}
      className={`p-2 m-1 bg-blue-600 rounded cursor-move ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      {name}
    </div>
  );
}
