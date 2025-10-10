import React from "react";
import { Download, Trash2, FolderOpen } from "lucide-react";
import { Scenario } from "../lib/db";

interface ScenarioListItemProps {
  scenario: Scenario;
  onLoad: (scenario: Scenario) => void;
  onExport: (scenario: Scenario) => void;
  onDelete: (id: number, name: string) => void;
}

export const ScenarioListItem: React.FC<ScenarioListItemProps> = ({
  scenario,
  onLoad,
  onExport,
  onDelete,
}) => (
  <div className="bg-[#333347] rounded-lg p-4 border border-[#3a3a4e] hover:border-indigo-500/50 transition-colors">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-100 text-lg">{scenario.name}</h4>
        {scenario.description && (
          <p className="text-gray-400 text-sm mt-1">{scenario.description}</p>
        )}
        <p className="text-gray-500 text-xs mt-2">
          Updated: {new Date(scenario.updated_at).toLocaleString()}
        </p>
      </div>
    </div>

    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => onLoad(scenario)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-500 transition-colors"
      >
        <FolderOpen className="w-4 h-4" />
        Load
      </button>

      <button
        onClick={() => onExport(scenario)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-500 transition-colors"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      <button
        onClick={() => onDelete(scenario.id!, scenario.name)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-500 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  </div>
);
