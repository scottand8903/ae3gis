import { useState } from "react";
import { db, Scenario, scenarioOperations } from "../lib/db";
import { useLiveQuery } from "dexie-react-hooks";

export function useScenarios() {
  // Auto-updating list of scenarios
  const scenarios = useLiveQuery(
    () => db.scenarios.orderBy("updated_at").reverse().toArray(),
    []
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create new scenario
  const createScenario = async (
    name: string,
    topologyData: any,
    description?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const id = await scenarioOperations.createScenario(
        name,
        topologyData,
        description
      );
      return id;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create scenario";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateScenario = async (
    id: number,
    updates: Partial<Omit<Scenario, "id" | "created_at">>
  ) => {
    setLoading(true);
    setError(null);

    try {
      await scenarioOperations.updateScenario(id, updates);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update scenario";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete scenario
  const deleteScenario = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await scenarioOperations.deleteScenario(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete scenario";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get scenario by ID
  const getScenarioById = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const scenario = await scenarioOperations.getScenarioById(id);
      return scenario;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch scenario";
      setError(message);
      throw err;
    }
  };

  return {
    scenarios,
    loading,
    error,
    createScenario,
    updateScenario,
    deleteScenario,
    getScenarioById,
  };
}
