"use client";
import { useEffect, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
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
  adapterCount?: number;
};

type Project = {
  project_id: string;
  name: string;
};

type Link = {
  nodes: {
    node_id: string;
    adapter_number: number;
    port_number: number;
  }[];
};

type UsedAdapter = {
  nodeId: number;
  adapterNumber: number;
};

export default function MainDropZone() {
  const dropRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<DroppedItem[]>([]);
  const [templates, setTemplates] = useState<Record<string, string>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [linkMode, setLinkMode] = useState(false);
  // const [selectedNode, setSelectedNode] = useState<DroppedItem | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [usedAdapters, setUsedAdapters] = useState<UsedAdapter[]>([]);
  const [selectedNodeData, setSelectedNodeData] = useState<{
    node: DroppedItem;
    adapter: number;
  } | null>(null);

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

  // Function to be able to move boxes around
  const moveBox = (id: number, left: number, top: number) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, left, top } : it))
    );
  };

  const [, drop] = useDrop<DndItem>(() => ({
    accept: ["SIDEBAR_ITEM", "BOX"],
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const initialOffset = monitor.getInitialClientOffset();
      const rect = dropRef.current?.getBoundingClientRect();

      if (offset && rect) {
        if (item.type === "SIDEBAR_ITEM") {
          // For new items from sidebar, use direct position
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
        } else {
          // For existing boxes, use the drag difference
          if (initialOffset && "mouseOffset" in item) {
            // Calculate new position accounting for mouse offset
            const newLeft = offset.x - rect.left - (item.mouseOffset?.x || 0);
            const newTop = offset.y - rect.top - (item.mouseOffset?.y || 0);

            // Add constraints
            const boxWidth = 100;
            const boxHeight = 100;
            const constrainedLeft = Math.max(
              0,
              Math.min(newLeft, rect.width - boxWidth)
            );
            const constrainedTop = Math.max(
              0,
              Math.min(newTop, rect.height - boxHeight)
            );

            moveBox(item.id, constrainedLeft, constrainedTop);
          }
        }
      }
    },
  }));

  drop(dropRef);

  const handleNodeClick = (clickedNode: DroppedItem, adapterNumber: number) => {
    if (!linkMode) {
      setLinkMode(true);
      setSelectedNodeData({ node: clickedNode, adapter: adapterNumber });
    } else if (
      selectedNodeData &&
      selectedNodeData.node.id !== clickedNode.id
    ) {
      // Create new network link
      const newLink: Link = {
        nodes: [
          {
            node_id: selectedNodeData.node.name,
            adapter_number: selectedNodeData.adapter,
            port_number: 0,
          },
          {
            node_id: clickedNode.name,
            adapter_number: adapterNumber,
            port_number: 0,
          },
        ],
      };
      setLinks((prev) => [...prev, newLink]);

      // Add used adapters to tracking
      setUsedAdapters((prev) => [
        ...prev,
        {
          nodeId: selectedNodeData.node.id,
          adapterNumber: selectedNodeData.adapter,
        },
        { nodeId: clickedNode.id, adapterNumber: adapterNumber },
      ]);

      // Reset link mode
      setLinkMode(false);
      setSelectedNodeData(null);
    }
  };

  // Export scenario JSON
  const handleExport = () => {
    const scenario = {
      nodes: items.map((item) => ({
        node_id: item.name,
        template_id: item.templateId,
        x: item.left,
        y: item.top,
      })),
      links,
    };
  };

  const handleNameChange = (id: number, newName: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: newName } : item))
    );
  };

  return (
    <div
      className="relative h-screen border-2 rounded bg-gray-700 overflow-hidden"
      ref={dropRef}
    >
      <h2 className="font-bold p-2">Drop Items Here</h2>

      <button
        onClick={() => setLinkMode((prev) => !prev)}
        className={`px-3 py-1 rounded ${
          linkMode ? "bg-green-600" : "bg-gray-600"
        }`}
      >
        {linkMode ? "Link Mode: ON" : "Link Mode: OFF"}
      </button>

      <SaveScenarioButton
        items={items}
        templates={templates}
        selectedProject={selectedProject}
        links={links}
      />

      <button onClick={handleExport} className="px-3 py-1 rounded bg-red-400">
        Build Scenario
      </button>

      <ProjectSelector
        projects={projects}
        selectedProject={selectedProject}
        onSelect={setSelectedProject}
      />

      {items.map((item) => (
        <DraggableBox
          key={item.id}
          {...item}
          moveBox={moveBox}
          dropZoneRef={dropRef}
          onNodeClick={(adapterId) => handleNodeClick(item, adapterId)}
          onNameChange={handleNameChange}
          isLinkMode={linkMode}
          isSelected={selectedNodeData?.node.id === item.id}
          usedAdapters={usedAdapters
            .filter((a) => a.nodeId === item.id)
            .map((a) => a.adapterNumber)}
        />
      ))}

      {/* Debug JSON preview */}
      <pre className="absolute bottom-0 left-0 bg-black text-white text-xs p-2 max-h-80 overflow-auto">
        {JSON.stringify(links, null, 2)}
      </pre>
    </div>
  );
}
