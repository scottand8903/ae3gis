import React, { useState } from "react";
import { useScenarios } from "../hooks/useScenarios";
import { DeviceConfig, Template, Project } from "../types/topology";
import { generateTopologyJSON } from "../utils/topologyGenerator";

interface SaveScenarioFormProps {
  itDevices: DeviceConfig[];
  otDevices: DeviceConfig[];
  firewallConfig: DeviceConfig;
  templates: Template[];
  selectedProject: Project | null;
  onSaveSuccess?: () => void;
}

export const SaveScenarioForm: React.FC<SaveScenarioFormProps> = ({
  itDevices,
  otDevices,
  firewallConfig,
  templates,
  selectedProject,
  onSaveSuccess,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { createScenario, loading, error } = useScenarios();

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter a scenario name");
      return;
    }

    try {
      const scenario = generateTopologyJSON(
        itDevices,
        otDevices,
        firewallConfig,
        templates,
        selectedProject
      );

      await createScenario(
        name.trim(),
        scenario,
        description.trim() || undefined
      );

      alert(`Scenario "${name}" saved successfully!`);
      setName("");
      setDescription("");
      setShowForm(false);
      onSaveSuccess?.();
    } catch (err) {
      console.error("Failed to save scenario:", err);
      alert("Failed to save scenario. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={() => setShowForm(!showForm)}
        className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-500 transition-colors shadow-lg"
      >
        {showForm ? "Cancel" : "Save Scenario"}
      </button>

      {showForm && (
        <div className="w-full bg-[#2a2a3e] rounded-lg p-6 border border-[#3a3a4e]">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            Save Current Configuration
          </h3>

          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
              <div className="text-red-400">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Scenario Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Production Network v1"
                className="w-full px-3 py-2 bg-[#252535] text-gray-200 border border-[#3a3a4e] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes about this scenario..."
                rows={3}
                className="w-full px-3 py-2 bg-[#252535] text-gray-200 border border-[#3a3a4e] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
            </div>

            <button
              onClick={handleSave}
              disabled={loading || !name.trim()}
              className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Saving..." : "Save Scenario"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
