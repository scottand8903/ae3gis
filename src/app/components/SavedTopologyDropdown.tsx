import { useState, useEffect } from 'react';

interface Topology {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function SavedTopologyDropdown() {
  const [topologies, setTopologies] = useState<Topology[]>([]);
  const [selectedTopology, setSelectedTopology] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopologies();
  }, []);

  const fetchTopologies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gns3/get-topology', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch topologies');
      }

      const data = await response.json();
      setTopologies(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTopology(e.target.value);
  };

  const getSelectedTopologyData = () => {
    return topologies.find(t => t.id === selectedTopology);
  };

  if (loading) return <div>Loading topologies...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-300">
          Select Topology
        </label>
        <select
          id="topology-select"
          value={selectedTopology}
          onChange={handleSelectionChange}
          className="px-3 py-2 bg-[#252535] text-gray-200 border border-[#3a3a4e] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">-- Select a topology --</option>
          {topologies.map((topology) => (
            <option key={topology.id} value={topology.id}>
              {topology.name} - {topology.description}
            </option>
          ))}
        </select>
      </div>

{selectedTopology && (
  <div className="p-4 bg-[#2a2a3e] border border-[#3a3a4e] rounded-lg">
    <h3 className="font-semibold text-gray-100 mb-3">Selected Topology Details:</h3>
    <div className="space-y-2">
      <p className="text-gray-300">
        <strong className="text-gray-200">Name:</strong> {getSelectedTopologyData()?.name}
      </p>
      <p className="text-gray-300">
        <strong className="text-gray-200">Description:</strong> {getSelectedTopologyData()?.description}
      </p>
      <p className="text-gray-300">
        <strong className="text-gray-200">ID:</strong> {getSelectedTopologyData()?.id}
      </p>
      <p className="text-gray-300">
        <strong className="text-gray-200">Created:</strong> {new Date(getSelectedTopologyData()?.created_at || '').toLocaleString()}
      </p>
    </div>
  </div>
)}
    </div>
  );
}