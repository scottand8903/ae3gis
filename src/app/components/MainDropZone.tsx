"use client";
import { useEffect, useRef, useState } from "react";
import { useDrop } from "react-dnd";
import DraggableBox from "./DraggableBox";
import ProjectSelector from "./ProjectSelector";
import SaveScenarioButton from "./SaveScenario";
import type { DndItem } from "./types";

type DroppedItem = {
  id: number;
  name: string;
  templateId: string;
  left: number;
  top: number;
};

type Project = {
  project_id: string;
  name: string;
};

export default function MainDropZone() {
  const dropRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<DroppedItem[]>([]);
  const [templates, setTemplates] = useState<Record<string, string>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Fetch templates + projects
  useEffect(() => {
    async function fetchData() {
      try {
        const [tplRes, projRes] = await Promise.all([
          fetch("/api/gns3/templates"),
          fetch("/api/gns3/projects"),
        ]);

        const tplData = await tplRes.json();
        const projData = await projRes.json();

        // Convert template list into a name→id map
        const templateMap: Record<string, string> = {};
        tplData.forEach((t: any) => {
          templateMap[t.name] = t.template_id;
        });

        setTemplates(templateMap);
        setProjects(projData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }

    fetchData();
  }, []);

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

          const newItem = {
            id: Date.now(),
            name: item.name,
            templateId: item.templateId,
            left,
            top,
          };
          setItems((prev) => [...prev, newItem]);
        }
      }
    },
  }));

  drop(dropRef);

  return (
    <div className="relative h-screen border-2 rounded bg-gray-700 overflow-hidden" ref={dropRef}>
      <h2 className="font-bold p-2">Drop Items Here</h2>

      <ProjectSelector
        projects={projects}
        selectedProject={selectedProject}
        onSelect={setSelectedProject}
      />

      <div className="absolute bottom-2 right-2">
        <SaveScenarioButton
          items={items}
          templates={templates}
          selectedProject={selectedProject}
        />
      </div>

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
