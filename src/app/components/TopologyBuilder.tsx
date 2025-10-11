import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Shield, Settings } from "lucide-react";

// Hooks
import { useTemplates } from "../hooks/useTemplates";
import { useProjects } from "../hooks/useProjects";
import { useTopologyConfig } from "../hooks/useTopologyConfig";
import { useScenarios } from "../hooks/useScenarios";
import { useBuildScenario } from "../hooks/useBuild";
import { useSaveTopology } from "../hooks/useTopology";

// Components
import { DeviceConfigRow } from "./DeviceConfigRow";
import { AddDeviceButton } from "./AddDeviceButton";
import { SaveScenarioForm } from "./SaveScenarioForm";
import { ScenarioListItem } from "./ScenarioListItem";
import SaveScenarioSection from './SaveTopology';
import SavedTopologyDropdown from "./SavedTopologyDropdown";

// Types
import { Scenario } from "../lib/db";
import { IpInput } from "./IpInput";
import ScriptDeployment from "./ScriptPusher";

// Constants
import {
  availableItDeviceTypes,
  availableOtDeviceTypes,
} from "../constants/deviceConfig";

// Utils
import { generateTopologyJSON, downloadJSON } from "../utils/topologyGenerator";

const TopologyBuilder: React.FC = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [showSavedScenarios, setShowSavedScenarios] = useState(false);
  const [currentGns3Ip, setCurrentGns3Ip] = useState<string>(
    process.env.NEXT_PUBLIC_GNS3_IP || ""
  );
  const [isServerConnected, setIsServerConnected] = useState(false);
  const [startScenario, setStartScenario] = useState(false);
  // Custom hooks
  const {
    templates,
    loading: templatesLoading,
    error: templatesError,
  } = useTemplates();
  const {
    projects,
    selectedProject,
    setSelectedProject,
    loading: projectsLoading,
    error: projectsError,
  } = useProjects();

  const {
    itDevices,
    otDevices,
    firewallConfig,
    setFirewallConfig,
    initializeTemplateIds,
    updateDeviceCount,
    updateDeviceTemplate,
    removeDevice,
    addDevice,
  } = useTopologyConfig(templates);

  const { scenarios, deleteScenario } = useScenarios();
  const {
    buildScenario,
    loading: buildLoading,
    error: buildError,
    result,
  } = useBuildScenario();

  const { 
    saveTopology, 
    loading: 
    saveLoading, 
    error: saveError, 
    result:
    saveResult } = useSaveTopology();

  // Initialize template IDs when templates are loaded
  useEffect(() => {
    if (templates.length > 0) {
      initializeTemplateIds();
    }
  }, [templates]);

  // Helper function to save active scenario to localStorage
  const saveActiveScenario = (scenarioData: any, scenarioName: string) => {
    const activeScenario = {
      name: scenarioName,
      nodes: scenarioData.nodes || [],
      gns3_server_ip: scenarioData.gns3_server_ip,
      project_id: scenarioData.project_id,
    };
    localStorage.setItem("activeScenario", JSON.stringify(activeScenario));
  };

  const handleSaveJSON = async (name: string, description: string) => {
  // console.log("GNS3 IP:", currentGns3Ip);
  const scenario = generateTopologyJSON(
    currentGns3Ip,
    itDevices,
    otDevices,
    firewallConfig,
    templates,
    selectedProject
  );
    const response = await saveTopology(scenario, name, description);

  // console.log("Build Scenario response:", response);
  if (response) {
    // Save as active scenario after successful build
    const scenarioName = `Built Scenario - ${new Date().toLocaleString()}`;
    saveActiveScenario(scenario, scenarioName);

    alert(
      `Scenario built successfully! You can now deploy scripts to the nodes.`
    );
  }
};

  const handleDownloadJSON = () => {
    const scenario = generateTopologyJSON(
      currentGns3Ip,
      itDevices,
      otDevices,
      firewallConfig,
      templates,
      selectedProject
    );
    downloadJSON(scenario);
  };

  const handleLoadScenario = (scenario: Scenario) => {
    const confirmed = window.confirm(
      `Load scenario "${scenario.name}"? This will replace your current configuration.`
    );

    if (!confirmed) return;

    try {
      const topologyData = scenario.topology_data;

      // Set GNS3 IP if available
      if (topologyData.gns3_server_ip) {
        setCurrentGns3Ip(topologyData.gns3_server_ip);
      }

      // Set project if available
      if (topologyData.project_id) {
        const project = projects.find(
          (p) => p.project_id === topologyData.project_id
        );
        if (project) {
          setSelectedProject(project);
        }
      }

      // Count devices by type and zone
      const deviceCounts = topologyData.nodes.reduce((acc: any, node: any) => {
        // Extract device type from node name (e.g., "Workstations_1" -> "Workstations")
        const deviceType = node.name.replace(/_\d+$/, "");
        const key = `${node.zone}-${deviceType}`;

        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Update IT devices
      itDevices.forEach((device) => {
        const count = deviceCounts[`IT-${device.name}`] || 0;
        updateDeviceCount(device.name, count, true);

        // Update template if found in topology data
        const nodeWithType = topologyData.nodes.find(
          (n: any) => n.zone === "IT" && n.name.startsWith(device.name)
        );
        if (nodeWithType?.template_id) {
          updateDeviceTemplate(device.name, nodeWithType.template_id, true);
        }
      });

      // Update OT devices
      otDevices.forEach((device) => {
        const count = deviceCounts[`OT-${device.name}`] || 0;
        updateDeviceCount(device.name, count, false);

        // Update template if found in topology data
        const nodeWithType = topologyData.nodes.find(
          (n: any) => n.zone === "OT" && n.name.startsWith(device.name)
        );
        if (nodeWithType?.template_id) {
          updateDeviceTemplate(device.name, nodeWithType.template_id, false);
        }
      });

      // Update firewall configuration
      const firewallCount = deviceCounts["DMZ-Firewall"] || 0;
      const firewallNode = topologyData.nodes.find((n: any) =>
        n.name.startsWith("Firewall")
      );

      setFirewallConfig((prev) => ({
        ...prev,
        count: firewallCount,
        ...(firewallNode?.template_id && {
          templateId: firewallNode.template_id,
        }),
      }));

      // Save as active scenario
      saveActiveScenario(topologyData, scenario.name);

      alert(`Successfully loaded scenario: ${scenario.name}`);
    } catch (err) {
      console.error("Failed to load scenario:", err);
      alert("Failed to load scenario. The data format may be incompatible.");
    }
  };

  const handleDeleteScenario = async (id: number, name: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteScenario(id);
      alert("Scenario deleted successfully!");
    } catch (err) {
      console.error("Failed to delete scenario:", err);
      alert("Failed to delete scenario. Please try again.");
    }
  };

  const handleExportScenario = (scenario: Scenario) => {
    downloadJSON(scenario.topology_data);
  };

  const handleBuildJSON = async () => {
    // console.log("GNS3 IP:", currentGns3Ip);
    const scenario = generateTopologyJSON(
      currentGns3Ip,
      itDevices,
      otDevices,
      firewallConfig,
      templates,
      selectedProject
    );
    const response = await buildScenario(
      scenario,
      currentGns3Ip,
      startScenario
    );

    // console.log("Build Scenario response:", response);
    if (response) {
      // Save as active scenario after successful build
      const scenarioName = `Built Scenario - ${new Date().toLocaleString()}`;
      saveActiveScenario(scenario, scenarioName);

      alert(
        `Scenario built successfully! You can now deploy scripts to the nodes.`
      );
    }
  };

  if (templatesLoading || projectsLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-300">Loading...</div>
        </div>
      </div>
    );
  }

  if (templatesError || projectsError) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <div className="text-red-400">
            Error: {templatesError || projectsError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          Network Topology Builder
        </h1>
        <p className="text-gray-400">
          Configure and generate GNS3 network topologies
        </p>
      </div>

      {/* Server Configuration Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowServerConfig(!showServerConfig)}
          className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Server Configuration</span>
          {showServerConfig ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Server Configuration Section */}
      {showServerConfig && (
        <div className="mb-8">
          {
            <IpInput
              onIpChange={setCurrentGns3Ip}
              onValidConnection={setIsServerConnected}
            />
          }
        </div>
      )}

      {/* Project Selection */}
      <div className="mb-8 bg-[#2a2a3e] rounded-lg p-6 border border-[#3a3a4e]">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">
          Project Selection
        </h2>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-300">
            Select Project:
          </label>
          <select
            value={selectedProject?.project_id || ""}
            onChange={(e) => {
              const project = projects.find(
                (p) => p.project_id === e.target.value
              );
              setSelectedProject(project || null);
            }}
            className="px-3 py-2 bg-[#252535] text-gray-200 border border-[#3a3a4e] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="" className="bg-[#252535]">
              -- Select a Project --
            </option>
            {projects.map((project) => (
              <option
                key={project.project_id}
                value={project.project_id}
                className="bg-[#252535]"
              >
                {project.name}
              </option>
            ))}
          </select>
          {isServerConnected && (
            <span className="text-green-400 text-sm">✓ Connected</span>
          )}
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <span>Advanced Configuration</span>
        </button>
      </div>

      {/* Device Configuration */}
      <div className="space-y-8">
        <div className="bg-[#2a2a3e] rounded-lg p-6 border border-[#3a3a4e]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-100">
              IT Network Devices
            </h2>
            <AddDeviceButton
              deviceTypes={availableItDeviceTypes}
              currentDevices={itDevices}
              isIT={true}
              label="IT"
              onAddDevice={addDevice}
            />
          </div>
          <div className="space-y-3">
            {itDevices.map((device) => (
              <DeviceConfigRow
                key={device.name}
                device={device}
                isIT={true}
                templates={templates}
                showAdvanced={showAdvanced}
                onCountChange={updateDeviceCount}
                onTemplateChange={updateDeviceTemplate}
                onRemove={() => removeDevice(device.name, true)}
              />
            ))}
          </div>
        </div>

        <div className="bg-[#2a2a3e] rounded-lg p-6 border border-[#3a3a4e]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-100">
              OT Network Devices
            </h2>
            <AddDeviceButton
              deviceTypes={availableOtDeviceTypes}
              currentDevices={otDevices}
              isIT={false}
              label="OT"
              onAddDevice={addDevice}
            />
          </div>
          <div className="space-y-3">
            {otDevices.map((device) => (
              <DeviceConfigRow
                key={device.name}
                device={device}
                isIT={false}
                templates={templates}
                showAdvanced={showAdvanced}
                onCountChange={updateDeviceCount}
                onTemplateChange={updateDeviceTemplate}
                onRemove={() => removeDevice(device.name, false)}
              />
            ))}
          </div>
        </div>

        <div className="bg-[#2a2a3e] rounded-lg p-6 border border-[#3a3a4e]">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Security Infrastructure
          </h2>
          <div className="flex items-center justify-between p-4 bg-[#333347] rounded-lg border border-[#3a3a4e]">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-indigo-400" />
              <div>
                <h4 className="font-medium text-gray-100">
                  {firewallConfig.name}
                </h4>
                <p className="text-sm text-gray-400">
                  {firewallConfig.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-300">
                  Count:
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={firewallConfig.count}
                  onChange={(e) =>
                    setFirewallConfig((prev) => ({
                      ...prev,
                      count: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-16 px-2 py-1 bg-[#252535] text-gray-200 border border-[#3a3a4e] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {showAdvanced && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-300">
                    Template:
                  </label>
                  <select
                    value={firewallConfig.templateId}
                    onChange={(e) =>
                      setFirewallConfig((prev) => ({
                        ...prev,
                        templateId: e.target.value,
                      }))
                    }
                    className="px-3 py-1 bg-[#252535] text-gray-200 border border-[#3a3a4e] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {templates.map((template) => (
                      <option
                        key={template.template_id}
                        value={template.template_id}
                        className="bg-[#252535]"
                      >
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          Topology Preview
        </h3>
        <div className="bg-[#2a2a3e] border border-[#3a3a4e] rounded-lg p-6">
          <div className="text-center text-gray-300">
            IT/OT Network with {itDevices.reduce((sum, d) => sum + d.count, 0)}{" "}
            IT devices, {otDevices.reduce((sum, d) => sum + d.count, 0)} OT
            devices, and {firewallConfig.count} firewall
            {firewallConfig.count !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center items-center gap-6">
        {/* Download Button */}
        <button
          onClick={handleDownloadJSON}
          className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors shadow-lg"
        >
          Download Topology JSON
        </button>

        {/* Build Button */}
        <button
          onClick={handleBuildJSON}
          className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors shadow-lg"
        >
          Build and Send Topology to GNS3 Server
        </button>

        {/* Checkbox */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={startScenario}
            onChange={(e) => setStartScenario(e.target.checked)}
            className="w-4 h-4 accent-indigo-600"
          />
          <span className="text-white-700">Start Scenario</span>
        </label>
      </div>
      <div className="mt-8">
      <SaveScenarioSection 
        onSave={handleSaveJSON}
        loading={saveLoading}
      />
    </div>  
    <SavedTopologyDropdown />  
      <div className="mt-8 flex gap-4 justify-center relative">
        <SaveScenarioForm
          currentGns3Ip={currentGns3Ip}
          itDevices={itDevices}
          otDevices={otDevices}
          firewallConfig={firewallConfig}
          templates={templates}
          selectedProject={selectedProject}
        />
      </div>

      {/* Saved Scenarios List */}
      <div className="mt-8">
        <button
          onClick={() => setShowSavedScenarios(!showSavedScenarios)}
          className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 transition-colors mb-4"
        >
          {showSavedScenarios ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <span className="text-lg font-semibold">
            Saved Scenarios {scenarios && `(${scenarios.length})`}
          </span>
        </button>

        {showSavedScenarios && (
          <div className="bg-[#2a2a3e] rounded-lg p-6 border border-[#3a3a4e]">
            {!scenarios || scenarios.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No saved scenarios yet. Save your first configuration above!
              </p>
            ) : (
              <div className="space-y-3">
                {scenarios.map((scenario) => (
                  <ScenarioListItem
                    key={scenario.id}
                    scenario={scenario}
                    onLoad={handleLoadScenario}
                    onExport={handleExportScenario}
                    onDelete={handleDeleteScenario}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Script Deployment Section */}
      <div className="mt-12">
        <ScriptDeployment
          nodes={(() => {
            const nodes: Array<{ node_id: string; name: string }> = [];

            // Add IT devices
            itDevices.forEach((device) => {
              for (let i = 0; i < device.count; i++) {
                nodes.push({
                  node_id: `${device.name}_${i + 1}`,
                  name: `${device.name}_${i + 1}`,
                });
              }
            });

            // Add OT devices
            otDevices.forEach((device) => {
              for (let i = 0; i < device.count; i++) {
                nodes.push({
                  node_id: `${device.name}_${i + 1}`,
                  name: `${device.name}_${i + 1}`,
                });
              }
            });

            // Add firewalls
            for (let i = 0; i < firewallConfig.count; i++) {
              nodes.push({
                node_id: `Firewall_${i + 1}`,
                name: `Firewall_${i + 1}`,
              });
            }

            return nodes;
          })()}
          gns3ServerIp={currentGns3Ip}
        />
      </div>
    </div>
  );
};

export default TopologyBuilder;
