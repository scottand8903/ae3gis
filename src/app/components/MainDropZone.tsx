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

export default function MainDropZone() {
  const dropRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<DroppedItem[]>([]);
  const [templates, setTemplates] = useState<Record<string, string>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [linkMode, setLinkMode] = useState(false);
  const [selectedNode, setSelectedNode] = useState<DroppedItem | null>(null);
  const [links, setLinks] = useState<Link[]>([]);

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

  // // Add locally so you see it right away
  //           const newItem = {
  //             id: Date.now(),
  //             name: name,
  //             templateId: item.templateId,
  //             left,
  //             top,
  //           };
  //           setItems((prev) => [...prev, newItem]);

  //           try {
  //             const projectId = "391a9fde-246c-4473-9024-202ff316c48a"; // replace with actual project ID

  //             const response = await fetch("/api/gns3/spawn-nodes", {
  //               method: "POST",
  //               headers: { "Content-Type": "application/json" },
  //               body: JSON.stringify({
  //                 projectId: projectId,
  //                 templateId: item.templateId,
  //                 x: left,
  //                 y: top,
  //                 name: item.name,
  //               }),
  //             });
  //             // const data = await response.json();
  //             // console.log("Project ID @:", projectId);
  //             // console.log("Template ID @:", item.templateId);
  //           } catch (err) {
  //             console.error("Error spawning node:", err);
  //           }

  // // Handle node click in link mode
  // const handleNodeClick = (node: DroppedItem) => {
  //   if (!linkMode) return;

  //   if (selectedNodes.length === 0) {
  //     setSelectedNodes([node]);
  //   } else if (selectedNodes.length === 1) {
  //     const first = selectedNodes[0];

  //     // Add link between first and this one
  //     const newLink: Link = {
  //       nodes: [
  //         { node_id: first.name, adapter_number: 0, port_number: 0 },
  //         { node_id: node.name, adapter_number: 0, port_number: 0 },
  //       ],
  //     };

  //     setLinks((prev) => [...prev, newLink]);
  //     setSelectedNodes([]);
  //   }
  // };

  const handleNodeClick = (clickedNode: DroppedItem) => {
    if (!linkMode) return;

    if (!selectedNode) {
      // first node selected
      setSelectedNode(clickedNode);
    } else if (selectedNode.id !== clickedNode.id) {
      // second node selected, create a link
      const newLink: Link = {
        nodes: [
          {
            node_id: selectedNode.name, // using name for now
            adapter_number: 0,
            port_number: 0,
          },
          {
            node_id: clickedNode.name,
            adapter_number: 0,
            port_number: 0,
          },
        ],
      };
      setLinks((prev) => [...prev, newLink]);
      setSelectedNode(null); // reset selection
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

    const blob = new Blob([JSON.stringify(scenario, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "scenario.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // const createLink = async (nodeA: string, nodeB: string) => {
  //   try {
  //     const projectId = "391a9fde-246c-4473-9024-202ff316c48a";
  //     const response = await fetch("/api/gns3/create-link", {
  //       method: "Post",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ projectId, nodeA, nodeB }),
  //     });

  //     const data = await response.json();
  //     console.log("Created link:", data);
  //   } catch (err) {
  //     console.error("Failed to create link:", err);
  //   }
  // };

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

      <button onClick={handleExport} className="px-3 py-1 rounded bg-blue-600">
        Export Scenario
      </button>

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
          onNodeClick={() => handleNodeClick(item)}
        />
      ))}

      {/* Debug JSON preview */}
      <pre className="absolute bottom-0 left-0 bg-black text-white text-xs p-2 max-h-40 overflow-auto">
        {JSON.stringify(links, null, 2)}
      </pre>
    </div>
  );
}
