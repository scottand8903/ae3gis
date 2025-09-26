"use client";
import { useDrag, useDrop } from "react-dnd";
import { useRef } from "react";
import { Divide } from "lucide-react";

type DraggableBoxProps = {
  id: number;
  name: string;
  left: number;
  top: number;
  moveBox: (id: number, left: number, top: number) => void;
  dropZoneRef: React.RefObject<HTMLDivElement | null>;
  onNodeClick?: () => void;
};

export default function DraggableBox({
  id,
  name,
  left,
  top,
  moveBox,
  dropZoneRef,
  onNodeClick,
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
      // onClick={() => gns3NodeId && onNodeClick(gns3NodeId)}
      className={`absolute p-2 bg-blue-500 text-white rounded cursor-move ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
      style={{ left, top }}
    >
      {name}
    </div>
  );
}

// "use client";
// import { useDrag } from "react-dnd";
// import { useRef } from "react";
// import { useState } from "react";

// type Props = {
//   id: number;
//   name: string;
//   left: number;
//   top: number;
//   moveBox: (id: number, left: number, top: number) => void;
//   dropZoneRef: React.RefObject<HTMLDivElement | null>;
//   onNodeClick?: () => void; // optional, used in link mode
// };

// export default function DraggableBox({
//   id,
//   name,
//   left,
//   top,
//   moveBox,
//   dropZoneRef,
//   onNodeClick,
// }: Props) {
//   const ref = useRef<HTMLDivElement | null>(null);
//   const [{ isDragging }, drag] = useDrag(
//     () => ({
//       type: "BOX",
//       item: { id, left, top, name },
//       collect: (monitor) => ({
//         isDragging: monitor.isDragging(),
//       }),
//       end: (item, monitor) => {
//         const didMove = monitor.getDifferenceFromInitialOffset();
//         if (didMove && (didMove.x !== 0 || didMove.y !== 0)) {
//           // Node was dragged → update position
//           const offset = monitor.getSourceClientOffset();
//           const rect = dropZoneRef.current?.getBoundingClientRect();
//           if (offset && rect) {
//             const newLeft = offset.x - rect.left;
//             const newTop = offset.y - rect.top;
//             moveBox(item.id, newLeft, newTop);
//           }
//         } else {
//           // Node was clicked → trigger click handler
//           onNodeClick?.();
//         }
//       },
//     }),
//     [id, left, top]
//   );

//   return (
//     <div
//       ref={(node) => {
//         if (node) drag(node);
//       }}
//       className={`absolute p-2 bg-blue-500 text-white rounded cursor-move select-none ${
//         isDragging ? "opacity-50" : "opacity-100"
//       }`}
//       style={{ left, top }}
//     >
//       {name}
//     </div>
//   );
// }
