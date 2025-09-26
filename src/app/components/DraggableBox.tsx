"use client";
import { useDrag } from "react-dnd";
import { useRef, useState, useEffect } from "react";
import { DragSourceMonitor } from "react-dnd";

type Props = {
  id: number;
  name: string;
  left: number;
  top: number;
  moveBox: (id: number, left: number, top: number) => void;
  dropZoneRef: React.RefObject<HTMLDivElement | null>;
  onNodeClick?: (adapterId: number) => void;
  onNameChange?: (id: number, newName: string) => void;
  isLinkMode?: boolean;
  isSelected?: boolean;
  usedAdapters: number[];
};

type DragItem = {
  id: number;
  left: number;
  top: number;
  name: string;
  mouseOffset: { x: number; y: number };
};

export default function DraggableBox({
  id,
  name,
  left,
  top,
  moveBox,
  dropZoneRef,
  onNodeClick,
  onNameChange,
  isLinkMode = false,
  isSelected = false,
  usedAdapters = [],
}: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const [adapters, setAdapters] = useState(1);
  const [nodeName, setNodeName] = useState(name);
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedAdapter, setSelectedAdapter] = useState<number>(0);
  const [selectedMenuAdapter, setSelectedMenuAdapter] = useState<number>(0);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Update the handleDrag function with proper types
  const handleDrag = (draggedItem: DragItem, monitor: DragSourceMonitor) => {
    const offset = monitor.getClientOffset();
    const rect = dropZoneRef.current?.getBoundingClientRect();

    if (offset && rect && draggedItem.mouseOffset) {
      let newLeft = offset.x - rect.left - draggedItem.mouseOffset.x;
      let newTop = offset.y - rect.top - draggedItem.mouseOffset.y;

      const boxWidth = 100;
      const boxHeight = 100;

      newLeft = Math.max(0, Math.min(newLeft, rect.width - boxWidth));
      newTop = Math.max(0, Math.min(newTop, rect.height - boxHeight));

      moveBox(draggedItem.id, newLeft, newTop);
    }
  };

  // Update the useDrag hook with proper types
  const [{ isDragging }, drag] = useDrag<
    DragItem,
    void,
    { isDragging: boolean }
  >({
    type: "BOX",
    item: (monitor: DragSourceMonitor) => {
      const initialOffset = monitor.getInitialClientOffset();
      const initialSourceClientOffset = monitor.getInitialSourceClientOffset();

      let mouseOffset = { x: 0, y: 0 };
      if (initialOffset && initialSourceClientOffset) {
        mouseOffset = {
          x: initialOffset.x - initialSourceClientOffset.x,
          y: initialOffset.y - initialSourceClientOffset.y,
        };
      }

      return {
        id,
        left,
        top,
        name,
        mouseOffset,
      };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item: DragItem | undefined, monitor: DragSourceMonitor) => {
      if (!item) return;

      const dropOffset = monitor.getDropResult();
      const clientOffset = monitor.getClientOffset();
      const initialClientOffset = monitor.getInitialClientOffset();
      const rect = dropZoneRef.current?.getBoundingClientRect();

      if (clientOffset && initialClientOffset && rect) {
        // Calculate the difference from where we started dragging
        const dragDiffX = clientOffset.x - initialClientOffset.x;
        const dragDiffY = clientOffset.y - initialClientOffset.y;

        // Apply the difference to the original position
        let newLeft = left + dragDiffX;
        let newTop = top + dragDiffY;

        const boxWidth = 100;
        const boxHeight = 100;

        // Apply constraints
        newLeft = Math.max(0, Math.min(newLeft, rect.width - boxWidth));
        newTop = Math.max(0, Math.min(newTop, rect.height - boxHeight));

        moveBox(item.id, newLeft, newTop);
      }
    },
  });

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLinkMode) {
      setShowMenu(!showMenu);
    }
  };

  const handleAdapterSelect = (e: React.MouseEvent, adapterNumber: number) => {
    e.stopPropagation();
    if (isLinkMode) {
      onNodeClick?.(adapterNumber);
    }
  };

  const handleAdapterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setAdapters(value);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setNodeName(newName);
    onNameChange?.(id, newName);
  };

  const handleMenuAdapterSelect = (value: number) => {
    setSelectedMenuAdapter(value);
  };

  return (
    <div
      ref={(node) => {
        if (node) drag(node);
      }}
      className={`absolute ${isDragging ? "opacity-50" : "opacity-100"}`}
      style={{ left, top }}
      onClick={handleMenuClick}
    >
      <div
        className={`bg-blue-500 text-white p-2 rounded cursor-move ${
          isSelected ? "ring-2 ring-yellow-400" : ""
        }`}
      >
        {nodeName}
      </div>

      {/* Regular menu (when not in link mode) */}
      {showMenu && !isLinkMode && (
        <div
          ref={menuRef}
          className="absolute top-full left-0 mt-1 bg-white text-black p-2 rounded shadow-lg z-10 min-w-[200px]"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label>Name:</label>
              <input
                type="text"
                value={nodeName}
                onChange={handleNameChange}
                className="flex-1 px-1 border rounded"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="flex items-center gap-2">
              <label>Adapters:</label>
              <input
                type="number"
                min="0"
                value={adapters}
                onChange={handleAdapterChange}
                className="w-16 px-1 border rounded"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="flex items-center gap-2">
              <label>Select Adapter:</label>
              <select
                value={selectedMenuAdapter}
                onChange={(e) =>
                  handleMenuAdapterSelect(Number(e.target.value))
                }
                className="flex-1 px-1 border rounded"
                onClick={(e) => e.stopPropagation()}
              >
                {Array.from({ length: adapters }, (_, i) => (
                  <option key={i} value={i} disabled={usedAdapters.includes(i)}>
                    Adapter {i} {usedAdapters.includes(i) ? "(Used)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded mt-2 w-full"
            onClick={() => onNodeClick?.(selectedMenuAdapter)}
            disabled={usedAdapters.includes(selectedMenuAdapter)}
          >
            Create Link
          </button>
        </div>
      )}

      {/* Show adapter selection in link mode */}
      {isLinkMode && (
        <div className="absolute top-full left-0 mt-1 bg-white text-black p-2 rounded shadow-lg z-10">
          <div className="text-sm font-bold mb-1">Select Adapter:</div>
          <div className="flex flex-col gap-1">
            {Array.from({ length: adapters }, (_, i) => (
              <button
                key={i}
                onClick={(e) => handleAdapterSelect(e, i)}
                className={`px-2 py-1 text-sm rounded ${
                  usedAdapters.includes(i)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-100 hover:bg-gray-200 cursor-pointer"
                }`}
                disabled={usedAdapters.includes(i)}
              >
                Adapter {i} {usedAdapters.includes(i) ? "(Used)" : ""}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
