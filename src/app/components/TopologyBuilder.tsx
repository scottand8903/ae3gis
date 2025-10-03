import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Shield, Settings } from "lucide-react";

// Hooks
import { useTemplates } from "../hooks/useTemplates";
import { useProjects } from "../hooks/useProjects";
import { useTopologyConfig } from "../hooks/useTopologyConfig";
import { useBuildScenario } from "../hooks/useBuild";

// Components
import { DeviceConfigRow } from "./DeviceConfigRow";
import { AddDeviceButton } from "./AddDeviceButton";
import { IpInput } from "./IpInput";

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
  const [currentGns3Ip, setCurrentGns3Ip] = useState<string>(
  process.env.NEXT_PUBLIC_GNS3_IP || ""
);
  const [isServerConnected, setIsServerConnected] = useState(false);

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

  const { buildScenario, loading: buildLoading, error: buildError, result } = useBuildScenario();


  // Initialize template IDs when templates are loaded
  useEffect(() => {
    if (templates.length > 0) {
      initializeTemplateIds();
    }
  }, [templates]);

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

  const handleBuildJSON = async () => {
    console.log("GNS3 IP:", currentGns3Ip);
    const scenario = generateTopologyJSON(
      currentGns3Ip,
      itDevices,
      otDevices,
      firewallConfig,
      templates,
      selectedProject
    );
      const response = await buildScenario(scenario, currentGns3Ip, true);

      console.log("Build Scenario response:", response);
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
          {<IpInput 
            onIpChange={setCurrentGns3Ip}
            onValidConnection={setIsServerConnected}
          />}
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

      {/* Generate Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleDownloadJSON}
          className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors shadow-lg"
        >
          Download Topology JSON
        </button>
      </div>

      {/* Generate Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleBuildJSON}
          className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors shadow-lg"
        >
          Build and Send Topology to GNS3 Server
        </button>
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
    </div>
  );
};

export default TopologyBuilder;