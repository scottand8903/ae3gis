import { useState } from "react";
import { generateTopologyJSON } from "../utils/topologyGenerator";

export type Topology = ReturnType<typeof generateTopologyJSON>;

export const useSaveTopology = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const saveTopology = async (
    scenario: Topology,
    name: string,
    description: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const apiRequest = {
        name: name,
        description: description,
        scenario,
      };

      console.log("Payload to AE3GIS:", apiRequest);
      const response = await fetch("/api/gns3/save-topology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiRequest),
      });

      if (!response.ok) {
        throw new Error(`Failed to send topology: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Build scenario error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    saveTopology, // function you call
    loading,
    error,
    result,
  };
};
