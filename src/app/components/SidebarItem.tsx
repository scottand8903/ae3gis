"use client";
import { useState } from "react";
import { useDrag } from "react-dnd";
import type { SidebarItem as SidebarItemType } from "./types";

type Props = { name: string; templateId: string };

export default function SidebarItem({ name, templateId }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [itemName, setItemName] = useState(name);

  const [{ isDragging }, drag] = useDrag<
    SidebarItemType,
    void,
    { isDragging: boolean }
  >(
    () => ({
      type: "SIDEBAR_ITEM",
      item: { type: "SIDEBAR_ITEM", name, templateId },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [itemName]
  );

  const handleNameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (itemName.trim() !== "") {
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleNameSubmit} className="p-2 m-1">
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Enter a name"
          className="w-full p-1 bg-blue border border-gray-400 rounded"
        />
        <button
          type="submit"
          className="mt-1 px-2 py-1 bg-green-500 text-blue rounded"
        >
          Done
        </button>
      </form>
    );
  }

  return (
    <div
      ref={(node) => {
        if (node) drag(node);
      }}
      onClick={() => setIsEditing(true)}
      className={`p-2 m-1 bg-blue-600 rounded cursor-move ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      {/* Display both names */}
      {itemName} ({name})
    </div>
  );
}
