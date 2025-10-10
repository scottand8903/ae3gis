"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Node } from "../types/topology";

interface ActiveScenario {
  name: string;
  nodes: Node[];
  gns3_server_ip: string;
  project_id: string;
}

interface ScriptConfig {
  node_name: string;
  local_path: string;
  remote_path: string;
  run_after_upload: boolean;
  executable: boolean;
  overwrite: boolean;
  run_timeout: number;
  shell: string;
}

interface DeploymentPayload {
  scripts: ScriptConfig[];
  gns3_server_ip: string;
  concurrency: number;
}

// Hardcoded available scripts - replace with your actual scripts
const AVAILABLE_SCRIPTS = [
  "hello.sh",
  "hi.sh",
  "run_dhcp_client.sh",
  "run_dhcp.sh",
  "run_http.sh",
  "run_server.sh",
];

const TestPage: React.FC = () => {
  const [gns3ServerIp, setGns3ServerIp] = useState<string>("");
  const [activeScenario, setActiveScenario] = useState<ActiveScenario | null>(
    null
  );
  const [selectedScripts, setSelectedScripts] = useState<
    Record<string, string>
  >({});
  const [deployingNodes, setDeployingNodes] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
    nodeId?: string;
  } | null>(null);

  // Load active scenario from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("activeScenario");
    if (stored) {
      try {
        const scenario: ActiveScenario = JSON.parse(stored);
        setActiveScenario(scenario);
        if (scenario.gns3_server_ip) {
          setGns3ServerIp(scenario.gns3_server_ip);
        }
      } catch (err) {
        console.error("Failed to load active scenario:", err);
      }
    }
  }, []);

  // Extract node names from active scenario, grouped by zone
  const nodesByZone = useMemo(() => {
    if (!activeScenario?.nodes) return { IT: [], OT: [], DMZ: [] };

    return activeScenario.nodes.reduce(
      (acc, node) => {
        const zone = node.zone as keyof typeof acc;
        if (!acc[zone]) acc[zone] = [];
        acc[zone].push(node);
        return acc;
      },
      { IT: [] as Node[], OT: [] as Node[], DMZ: [] as Node[] }
    );
  }, [activeScenario]);

  const handleScriptSelect = (nodeId: string, scriptFilename: string) => {
    setSelectedScripts((prev) => ({
      ...prev,
      [nodeId]: scriptFilename,
    }));
  };

  const handleDeploy = async (node: Node) => {
    const scriptFilename = selectedScripts[node.node_id];

    if (!scriptFilename) {
      setMessage({
        type: "error",
        text: "Please select a script first",
        nodeId: node.node_id,
      });
      return;
    }

    if (!gns3ServerIp) {
      setMessage({
        type: "error",
        text: "GNS3 Server IP is required",
        nodeId: node.node_id,
      });
      return;
    }

    setDeployingNodes((prev) => new Set(prev).add(node.node_id));
    setMessage(null);

    const payload: DeploymentPayload = {
      scripts: [
        {
          node_name: node.name,
          local_path: `/home/scott/Documents/GitHub/ae3gis-gns3-api/scripts/${scriptFilename}`,
          remote_path: `/tmp/${scriptFilename}`,
          run_after_upload: false,
          executable: true,
          overwrite: true,
          run_timeout: 10,
          shell: "sh",
        },
      ],
      gns3_server_ip: gns3ServerIp,
      concurrency: 5,
    };

    try {
      const res = await fetch("/api/gns3/scripts/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      await res.json();
      setMessage({
        type: "success",
        text: `Successfully deployed ${scriptFilename} to ${node.name}`,
        nodeId: node.node_id,
      });

      // Clear selection for this node after successful deployment
      setSelectedScripts((prev) => {
        const updated = { ...prev };
        delete updated[node.node_id];
        return updated;
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Deployment failed",
        nodeId: node.node_id,
      });
    } finally {
      setDeployingNodes((prev) => {
        const updated = new Set(prev);
        updated.delete(node.node_id);
        return updated;
      });
    }
  };

  const getZoneBadgeColor = (zone: string): string => {
    switch (zone) {
      case "IT":
        return "bg-blue-900/30 text-blue-400 border-blue-500/50";
      case "OT":
        return "bg-orange-900/30 text-orange-400 border-orange-500/50";
      case "DMZ":
        return "bg-purple-900/30 text-purple-400 border-purple-500/50";
      default:
        return "bg-gray-900/30 text-gray-400 border-gray-500/50";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-100 mb-2">
        Script Deployment
      </h1>
      <p className="text-gray-400 mb-6">
        Deploy scripts to nodes in your active scenario
      </p>

      {!activeScenario ? (
        <div className="bg-amber-900/20 border border-amber-500/50 rounded-lg p-6 mb-6">
          <h3 className="text-amber-400 font-semibold mb-2">
            ⚠️ No Active Scenario
          </h3>
          <p className="text-gray-300 text-sm mb-3">
            Please build or load a scenario first:
          </p>
          <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
            <li>Go to Topology Builder → Configure devices → Build scenario</li>
            <li>Or load a saved scenario from the Topology Builder</li>
          </ul>
        </div>
      ) : (
        <>
          <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-green-400 font-semibold text-sm">
                  ✓ Active Scenario
                </h3>
                <p className="text-gray-300 text-sm mt-1">
                  {activeScenario.name}
                </p>
              </div>
              <div className="text-right text-xs text-gray-400">
                <div>{activeScenario.nodes.length} nodes available</div>
                {activeScenario.project_id && (
                  <div className="mt-1">
                    Project: {activeScenario.project_id}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#2a2a3e] rounded-lg p-6 border border-[#3a3a4e] mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              GNS3 Server IP
            </label>
            <input
              type="text"
              value={gns3ServerIp}
              onChange={(e) => setGns3ServerIp(e.target.value)}
              placeholder="192.168.56.102"
              className="w-full px-3 py-2 bg-[#252535] text-gray-200 border border-[#3a3a4e] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Available Nodes by Zone */}
          <div className="bg-[#2a2a3e] rounded-lg p-6 border border-[#3a3a4e]">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">
              Deploy Scripts to Nodes
            </h3>
            <div className="space-y-6">
              {Object.entries(nodesByZone).map(([zone, nodes]) => {
                if (nodes.length === 0) return null;
                return (
                  <div key={zone}>
                    <h4
                      className={`text-sm font-semibold mb-3 px-3 py-1.5 rounded inline-block border ${getZoneBadgeColor(
                        zone
                      )}`}
                    >
                      {zone} Network ({nodes.length})
                    </h4>
                    <div className="space-y-3 mt-3">
                      {nodes.map((node) => {
                        const isDeploying = deployingNodes.has(node.node_id);
                        const hasMessage = message?.nodeId === node.node_id;

                        return (
                          <div
                            key={node.node_id}
                            className="bg-[#333347] rounded-lg border border-[#3a3a4e] p-4"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-200 mb-1">
                                  {node.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {node.node_id.slice(0, 8)}...
                                </div>
                              </div>

                              <div className="flex items-center gap-3 flex-1">
                                <select
                                  value={selectedScripts[node.node_id] || ""}
                                  onChange={(e) =>
                                    handleScriptSelect(
                                      node.node_id,
                                      e.target.value
                                    )
                                  }
                                  disabled={isDeploying}
                                  className="flex-1 px-3 py-2 bg-[#252535] text-gray-200 border border-[#3a3a4e] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 text-sm"
                                >
                                  <option value="" className="bg-[#252535]">
                                    -- Select Script --
                                  </option>
                                  {AVAILABLE_SCRIPTS.map((script) => (
                                    <option
                                      key={script}
                                      value={script}
                                      className="bg-[#252535]"
                                    >
                                      {script}
                                    </option>
                                  ))}
                                </select>

                                <button
                                  onClick={() => handleDeploy(node)}
                                  disabled={
                                    !selectedScripts[node.node_id] ||
                                    isDeploying
                                  }
                                  className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm whitespace-nowrap"
                                >
                                  {isDeploying ? "Deploying..." : "Deploy"}
                                </button>
                              </div>
                            </div>

                            {hasMessage && message && (
                              <div
                                className={`mt-3 p-2 rounded text-xs ${
                                  message.type === "success"
                                    ? "bg-green-900/30 text-green-400"
                                    : "bg-red-900/30 text-red-400"
                                }`}
                              >
                                {message.text}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TestPage;
