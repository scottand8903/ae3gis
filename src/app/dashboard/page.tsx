"use client";
import { useState } from "react";

export default function Gns3Test() {
  const [projects, setProjects] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  const loadProjects = async () => {
    const res = await fetch("/api/gns3/projects");
    setProjects(await res.json());
  };

  const loadTemplates = async () => {
    const res = await fetch("/api/gns3/templates");
    setTemplates(await res.json());
  };

  return (
    <div>
      <button onClick={loadProjects}>Show Projects</button>
      <ul>
        {projects.map((p) => (
          <li key={p.project_id}>{p.name}</li>
        ))}
      </ul>

      <button onClick={loadTemplates}>Show Templates</button>
      <ul>
        {templates.map((t) => (
          <li key={t.template_id}>
            {t.name} ({t.category})
          </li>
        ))}
      </ul>
    </div>
  );
}
