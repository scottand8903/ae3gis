export interface Scenario {
  id?: number; // Optional, Dexie auto-generates this field
  name: string;
  description?: string;
  topology_data: any; // JSON from generateTopologyJSON()
  created_at: Date;
  updated_at: Date;
}

import Dexie, { Table } from "dexie";

class TopologyDatabase extends Dexie {
  // Table for holding scenarios
  scenarios!: Table<Scenario>;

  constructor() {
    super("TopologyDatabase"); // Database name in browser

    // Define version 1 of schema
    this.version(1).stores({
      scenarios: "++id, name, created_at, updated_at",
    });
  }
}

// Export single database instance
export const db = new TopologyDatabase();

// Helper functions for database operations
export const scenarioOperations = {
  // Create a new scenario
  async createScenario(
    name: string,
    topologyData: any,
    description?: string
  ): Promise<number> {
    const now = new Date();

    const id = await db.scenarios.add({
      name,
      description,
      topology_data: topologyData,
      created_at: now,
      updated_at: now,
    });
    return id;
  },

  // Get all scenarios
  async getAllScenarios(): Promise<Scenario[]> {
    return await db.scenarios.orderBy("updated_at").reverse().toArray();
  },

  // Get single scenario by ID
  async getScenarioById(id: number): Promise<Scenario | undefined> {
    return await db.scenarios.get(id);
  },

  // Search scenarios by name
  async searchScenarios(searchTerm: string): Promise<Scenario[]> {
    return await db.scenarios
      .filter((scenario) =>
        scenario.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .toArray();
  },

  // Get total count of scenarios
  async getScenarioCount(): Promise<number> {
    return await db.scenarios.count();
  },

  // Update scenario
  async updateScenario(
    id: number,
    updates: Partial<Omit<Scenario, "id" | "created_at">>
  ): Promise<number> {
    return await db.scenarios.update(id, {
      ...updates,
      updated_at: new Date(),
    });
  },

  // Delete scenario
  async deleteScenario(id: number): Promise<void> {
    await db.scenarios.delete(id);
  },

  // Detele all scenarios
  async deleteAllScenarios(): Promise<void> {
    await db.scenarios.clear();
  },
};
