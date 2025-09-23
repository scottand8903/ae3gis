"use client"; // needed in Next.js App Router
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react"; // pnpm add lucide-react
import SidebarItem from "./SidebarItem";

type Template = {
  template_id: string;
  name: string;
};

export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  // toggle function
  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch("/api/gns3/templates");
        const data = await res.json();
        setTemplates(data);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      }
    }
    fetchTemplates();
  }, []);

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-6">Ae3gis</h1>

      <nav className="flex flex-col gap-2">
        {/* Scenario */}
        <button
          onClick={() => toggleMenu("dashboard")}
          className="flex items-center justify-between hover:bg-gray-700 p-2 rounded"
        >
          <span>Scenario Builder</span>
          {openMenu === "dashboard" ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>
        {openMenu === "dashboard" && (
          <div className="ml-4 flex flex-col gap-1 max-h-150 overflow-y-auto">
            {loading && <span className="text-gray-400">Loading...</span>}
            {!loading &&
              templates.map((template) => (
                <SidebarItem
                  key={template.template_id}
                  name={template.name}
                  templateId={template.template_id}
                />
              ))}
            {!loading && templates.length === 0 && (
              <span className="text-gray-400">No templates found.</span>
            )}
          </div>
        )}

        {/* Scenario's */}
        <button
          onClick={() => toggleMenu("settings")}
          className="flex items-center justify-between hover:bg-gray-700 p-2 rounded"
        >
          <span>Scenarios</span>
          {openMenu === "settings" ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>
        {openMenu === "settings" && (
          <div className="ml-4 flex flex-col gap-1">
            <Link href="/profile" className="hover:bg-gray-700 p-2 rounded">
              Stuxnet
            </Link>
            <Link href="/account" className="hover:bg-gray-700 p-2 rounded">
              Other Scenario
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
