"use client";
import React from "react";

type Project = {
  project_id: string;
  name: string;
};

interface ProjectSelectorProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelect: (project: Project | null) => void;
}

export default function ProjectSelector({
  projects,
  selectedProject,
  onSelect,
}: ProjectSelectorProps) {
  return (
    <div className="flex items-center gap-3 p-2">
      <label className="text-white font-semibold">Project:</label>
      <select
        className="px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        value={selectedProject?.project_id || ""}
        onChange={(e) => {
          const proj = projects.find((p) => p.project_id === e.target.value);
          onSelect(proj || null);
        }}
      >
        <option value="">-- Select a Project --</option>
        {projects.map((proj) => (
          <option
            key={proj.project_id}
            value={proj.project_id}
            className="bg-gray-800 text-white"
          >
            {proj.name}
          </option>
        ))}
      </select>
    </div>
  );
}
