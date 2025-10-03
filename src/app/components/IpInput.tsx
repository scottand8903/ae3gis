import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

interface IpInputProps {
  onIpChange?: (ip: string) => void;
  onValidConnection?: (isValid: boolean) => void;
}

export const IpInput: React.FC<IpInputProps> = ({ 
  onIpChange, 
  onValidConnection 
}) => {
  // Extract IP from environment variable on component mount
  const [ip, setIp] = useState<string>("");
  const [port, setPort] = useState<string>("80");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    // Parse the GNS3_URL from environment variable
    // This will be available at build time via NEXT_PUBLIC_ prefix
    const gns3Url = process.env.NEXT_PUBLIC_GNS3_URL;
    
    if (gns3Url) {
      try {
        const url = new URL(gns3Url);
        const extractedIp = url.hostname;
        const extractedPort = url.port || "80";
        
        setIp(extractedIp);
        setPort(extractedPort);
        
        // Notify parent component if needed
        if (onIpChange) {
          onIpChange(extractedIp);
        }
      } catch (error) {
        console.error("Invalid GNS3_URL format:", error);
      }
    }
  }, [onIpChange]);

  const validateIp = (ipAddress: string): boolean => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ipAddress);
  };

  const testConnection = async () => {
    if (!validateIp(ip)) {
      setConnectionStatus("error");
      setErrorMessage("Invalid IP address format");
      return;
    }

    setIsConnecting(true);
    setConnectionStatus("idle");
    setErrorMessage("");

    try {
      // Test connection to GNS3 server
      const response = await fetch("/api/gns3/projects");
      
      if (response.ok) {
        setConnectionStatus("success");
        if (onValidConnection) {
          onValidConnection(true);
        }
      } else {
        throw new Error("Failed to connect to GNS3 server");
      }
    } catch (error) {
      setConnectionStatus("error");
      setErrorMessage("Could not connect to GNS3 server. Please check IP and ensure server is running.");
      if (onValidConnection) {
        onValidConnection(false);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleIpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIp = e.target.value;
    setIp(newIp);
    setConnectionStatus("idle");
    
    if (onIpChange) {
      onIpChange(newIp);
    }
  };

  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPort(e.target.value);
    setConnectionStatus("idle");
  };

  const updateEnvVariable = () => {
    // Note: You cannot directly update .env variables from the client side
    // This would need to be handled by your build process or server
    const newUrl = `http://${ip}:${port}/v2`;
    
    // For development, you might want to store this in localStorage
    // or pass it to your API routes
    localStorage.setItem("GNS3_URL", newUrl);
    
    // Show instructions to user
    alert(`To make this permanent, update your .env.local file:\nNEXT_PUBLIC_GNS3_URL=${newUrl}`);
  };

  return (
    <div className="bg-[#2a2a3e] rounded-lg p-6 border border-[#3a3a4e]">
      <h2 className="text-xl font-semibold text-gray-100 mb-4">
        GNS3 Server Configuration
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Server IP Address
            </label>
            <input
              type="text"
              value={ip}
              onChange={handleIpChange}
              placeholder="192.168.56.102"
              className={`w-full px-3 py-2 bg-[#252535] text-gray-200 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                connectionStatus === "error" 
                  ? "border-red-500" 
                  : connectionStatus === "success"
                  ? "border-green-500"
                  : "border-[#3a3a4e]"
              }`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Port
            </label>
            <input
              type="text"
              value={port}
              onChange={handlePortChange}
              placeholder="80"
              className="w-full px-3 py-2 bg-[#252535] text-gray-200 border border-[#3a3a4e] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Connection Status */}
        {connectionStatus === "success" && (
          <div className="flex items-center space-x-2 text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">Connected successfully to GNS3 server</span>
          </div>
        )}
        
        {connectionStatus === "error" && (
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={testConnection}
            disabled={isConnecting || !ip}
            className={`px-4 py-2 font-medium rounded-lg transition-colors ${
              isConnecting
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
          >
            {isConnecting ? "Testing..." : "Test Connection"}
          </button>
          
          <button
            onClick={updateEnvVariable}
            disabled={!validateIp(ip)}
            className="px-4 py-2 bg-[#333347] text-gray-200 font-medium rounded-lg hover:bg-[#3a3a4e] transition-colors border border-[#3a3a4e]"
          >
            Save Configuration
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-[#252535] rounded-lg border border-[#3a3a4e]">
          <p className="text-sm text-gray-400">
            <span className="font-semibold">Current Environment:</span> {process.env.NEXT_PUBLIC_GNS3_URL || "Not set"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            To permanently update, modify NEXT_PUBLIC_GNS3_URL in your .env.local file
          </p>
        </div>
      </div>
    </div>
  );
};