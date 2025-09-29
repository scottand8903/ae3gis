import React from "react";
import { Minus } from "lucide-react";
import { DeviceConfig, Template } from "../types/topology";

interface DeviceConfigRowProps {
  device: DeviceConfig;
  isIT: boolean;
  templates: Template[];
  showAdvanced: boolean;
  onCountChange: (deviceName: string, newCount: number, isIT: boolean) => void;
  onTemplateChange: (
    deviceName: string,
    templateId: string,
    isIT: boolean
  ) => void;
  onRemove: () => void;
}

export const DeviceConfigRow: React.FC<DeviceConfigRowProps> = ({
  device,
  isIT,
  templates,
  showAdvanced,
  onCountChange,
  onTemplateChange,
  onRemove,
}) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div className="flex items-center space-x-3">
      {device.icon}
      <div>
        <h4 className="font-medium text-gray-900">{device.name}</h4>
        <p className="text-sm text-gray-500">{device.description}</p>
      </div>
    </div>
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Count:</label>
        <input
          type="number"
          min="0"
          max="10"
          value={device.count}
          onChange={(e) =>
            onCountChange(device.name, parseInt(e.target.value) || 0, isIT)
          }
          className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      {showAdvanced && (
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Template:</label>
          <select
            value={device.templateId}
            onChange={(e) =>
              onTemplateChange(device.name, e.target.value, isIT)
            }
            className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {templates.map((template) => (
              <option key={template.template_id} value={template.template_id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <button
        onClick={onRemove}
        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
        title="Remove device type"
      >
        <Minus className="w-4 h-4" />
      </button>
    </div>
  </div>
);
