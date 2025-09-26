"use client";
import React from "react";

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

type Link = {
  nodes: {
    node_id: string;
    adapter_number: number;
    port_number: number;
  }[];
};

interface SaveScenarioButtonProps {
  items: DroppedItem[];
  templates: Record<string, string>;
  selectedProject: Project | null;
  links: Link[];
}

export default function SaveScenarioButton({
  items,
  templates,
  selectedProject,
  links,
}: SaveScenarioButtonProps) {
  const saveScenario = () => {
    if (!selectedProject) {
      alert("Please select a project before saving.");
      return;
    }

    const nodes = items.map((it) => ({
      name: it.name,
      template_id: it.templateId,
      x: it.left,
      y: it.top,
    }));

    const scenario = {
      gns3_server_ip: process.env.NEXT_PUBLIC_GNS3_IP || "127.0.0.1",
      project_name: selectedProject.name,
      project_id: selectedProject.project_id,
      templates,
      nodes,
      links,
    };

    const filename = prompt("Enter a file name:", "scenario.json");
    if (!filename) return;

    const blob = new Blob([JSON.stringify(scenario, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".json") ? filename : `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={saveScenario}
      className="m-2 px-3 py-1 bg-blue-500 text-white rounded"
    >
      Save Scenario JSON
    </button>
  );
}
