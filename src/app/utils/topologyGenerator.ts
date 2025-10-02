import { DeviceConfig, Node, Link, Template, Project } from "../types/topology";

export const generatePositions = (
  deviceCount: number,
  zone: "IT" | "OT" | "DMZ"
) => {
  const positions = [];

  if (zone === "DMZ") {
    // Firewall is always at center
    positions.push({ x: 0, y: 0 });
    return positions;
  }

  // For IT and OT devices, we need to position them hierarchically
  // This is a placeholder - the actual positioning will be done in generateTopologyJSON
  for (let i = 0; i < deviceCount; i++) {
    positions.push({ x: 0, y: 0 }); // Temporary positions
  }
  return positions;
};

export const calculateHierarchicalPositions = (nodes: Node[]): Node[] => {
  const positionedNodes = [...nodes];

  // Separate nodes by type and zone
  const firewalls = nodes.filter((n) => n.zone === "DMZ");
  const itSwitches = nodes.filter(
    (n) => n.zone === "IT" && n.name.toLowerCase().includes("switch")
  );
  const otSwitches = nodes.filter(
    (n) => n.zone === "OT" && n.name.toLowerCase().includes("switch")
  );
  const itDevices = nodes.filter(
    (n) => n.zone === "IT" && !n.name.toLowerCase().includes("switch")
  );
  const otDevices = nodes.filter(
    (n) => n.zone === "OT" && !n.name.toLowerCase().includes("switch")
  );

  // Position firewall at center (0, 0)
  firewalls.forEach((firewall) => {
    const nodeIndex = positionedNodes.findIndex(
      (n) => n.node_id === firewall.node_id
    );
    if (nodeIndex !== -1) {
      positionedNodes[nodeIndex] = { ...firewall, x: 0, y: 0 };
    }
  });

  // Position IT switches (above firewall, Y > 0)
  const itSwitchY = 100;
  const switchSpacing = 400;
  itSwitches.forEach((itSwitch, index) => {
    const nodeIndex = positionedNodes.findIndex(
      (n) => n.node_id === itSwitch.node_id
    );
    if (nodeIndex !== -1) {
      const x = (index - (itSwitches.length - 1) / 2) * switchSpacing;
      positionedNodes[nodeIndex] = { ...itSwitch, x, y: itSwitchY };
    }
  });

  // Position OT switches (below firewall, Y < 0)
  const otSwitchY = -150;
  otSwitches.forEach((otSwitch, index) => {
    const nodeIndex = positionedNodes.findIndex(
      (n) => n.node_id === otSwitch.node_id
    );
    if (nodeIndex !== -1) {
      const x = (index - (otSwitches.length - 1) / 2) * switchSpacing;
      positionedNodes[nodeIndex] = { ...otSwitch, x, y: otSwitchY };
    }
  });

  // Position IT devices in grids (taller than wide)
  if (itDevices.length > 0 && itSwitches.length > 0) {
    const devicesPerSwitch = Math.ceil(itDevices.length / itSwitches.length);
    const deviceSpacingX = 120; // Horizontal spacing between devices
    const deviceSpacingY = 70; // Vertical spacing between devices
    const itDeviceStartY = itSwitchY + 60; // Starting Y position for IT devices (above switches)

    // Calculate grid dimensions (taller than wide - 2 columns max)
    const gridColumns = 2;
    const gridRows = Math.ceil(devicesPerSwitch / gridColumns);

    itDevices.forEach((device, index) => {
      const nodeIndex = positionedNodes.findIndex(
        (n) => n.node_id === device.node_id
      );
      if (nodeIndex !== -1) {
        // Determine which switch group this device belongs to
        const switchGroup = Math.floor(index / devicesPerSwitch);
        const positionInGroup = index % devicesPerSwitch;

        // Calculate row and column in the grid
        const row = Math.floor(positionInGroup / gridColumns);
        const col = positionInGroup % gridColumns;

        // Get the switch X position for this group
        const switchX = itSwitches[switchGroup]
          ? (switchGroup - (itSwitches.length - 1) / 2) * switchSpacing
          : 0;

        // Determine if this is the leftmost or rightmost switch
        const isLeftSwitch = switchGroup === 0 && itSwitches.length > 1;
        const isRightSwitch =
          switchGroup === itSwitches.length - 1 && itSwitches.length > 1;
        const isSingleSwitch = itSwitches.length === 1;

        let x, y;

        if (isLeftSwitch) {
          // Left switch: grid to the left (negative X offset)
          x = switchX - (gridColumns - col) * deviceSpacingX;
          y = itDeviceStartY + row * deviceSpacingY;
        } else if (isRightSwitch) {
          // Right switch: grid to the right (positive X offset)
          x = switchX + (col + 1) * deviceSpacingX;
          y = itDeviceStartY + row * deviceSpacingY;
        } else {
          // Middle switch or single switch: centered above
          x = switchX + (col - (gridColumns - 1) / 2) * deviceSpacingX;
          y = itDeviceStartY + row * deviceSpacingY;
        }

        // Ensure within bounds
        const clampedX = Math.max(-1000, Math.min(945, x));
        const clampedY = Math.max(50, Math.min(470, y));

        positionedNodes[nodeIndex] = { ...device, x: clampedX, y: clampedY };
      }
    });
  }

  // Position OT devices in grids (two rows, wider than tall)
  if (otDevices.length > 0 && otSwitches.length > 0) {
    const devicesPerSwitch = Math.ceil(otDevices.length / otSwitches.length);
    const deviceSpacingX = 120; // Horizontal spacing between devices
    const deviceSpacingY = 70; // Vertical spacing between devices

    // Calculate grid dimensions (two rows, horizontal layout)
    const gridRows = 2;
    const gridColumns = Math.ceil(devicesPerSwitch / gridRows);

    // Start from more negative Y and work towards 0
    const otDeviceStartY = otSwitchY - 60 - deviceSpacingY;

    otDevices.forEach((device, index) => {
      const nodeIndex = positionedNodes.findIndex(
        (n) => n.node_id === device.node_id
      );
      if (nodeIndex !== -1) {
        // Determine which switch group this device belongs to
        const switchGroup = Math.floor(index / devicesPerSwitch);
        const positionInGroup = index % devicesPerSwitch;

        // Calculate row and column in the grid (fill row by row)
        const row = Math.floor(positionInGroup / gridColumns);
        const col = positionInGroup % gridColumns;

        // Get the switch X position for this group
        const switchX = otSwitches[switchGroup]
          ? (switchGroup - (otSwitches.length - 1) / 2) * switchSpacing
          : 0;

        // Determine if this is the leftmost or rightmost switch
        const isLeftSwitch = switchGroup === 0 && otSwitches.length > 1;
        const isRightSwitch =
          switchGroup === otSwitches.length - 1 && otSwitches.length > 1;
        const isSingleSwitch = otSwitches.length === 1;

        let x, y;

        if (isLeftSwitch) {
          // Left switch: grid to the left (negative X offset)
          x = switchX - (gridColumns - col) * deviceSpacingX;
          y = otDeviceStartY + row * deviceSpacingY; // Start from bottom, work up
        } else if (isRightSwitch) {
          // Right switch: grid to the right (positive X offset)
          x = switchX + (col + 1) * deviceSpacingX;
          y = otDeviceStartY + row * deviceSpacingY; // Start from bottom, work up
        } else {
          // Middle switch or single switch: centered below
          x = switchX + (col - (gridColumns - 1) / 2) * deviceSpacingX;
          y = otDeviceStartY + row * deviceSpacingY; // Start from bottom, work up
        }

        // Ensure within bounds
        const clampedX = Math.max(-1000, Math.min(945, x));
        const clampedY = Math.max(-505, Math.min(-50, y));

        positionedNodes[nodeIndex] = { ...device, x: clampedX, y: clampedY };
      }
    });
  }

  return positionedNodes;
};

export const generateBasicLinks = (nodes: Node[]): Link[] => {
  const links: Link[] = [];
  const PORTS_PER_SWITCH = 13;

  // Separate nodes by zone and type
  const itSwitches = nodes.filter(
    (n) => n.zone === "IT" && n.name.toLowerCase().includes("switch")
  );
  const otSwitches = nodes.filter(
    (n) => n.zone === "OT" && n.name.toLowerCase().includes("switch")
  );
  const firewalls = nodes.filter(
    (n) => n.zone === "DMZ" && n.name.toLowerCase().includes("firewall")
  );

  // IT devices (excluding switches)
  const itDevices = nodes.filter(
    (n) => n.zone === "IT" && !n.name.toLowerCase().includes("switch")
  );

  // OT devices (excluding switches)
  const otDevices = nodes.filter(
    (n) => n.zone === "OT" && !n.name.toLowerCase().includes("switch")
  );

  // Connect IT devices to IT switches - evenly distributed
  if (itSwitches.length > 0) {
    const devicesPerSwitch = Math.ceil(itDevices.length / itSwitches.length);

    itDevices.forEach((device, index) => {
      // Calculate which switch based on even distribution
      const switchIndex = Math.floor(index / devicesPerSwitch);
      const targetSwitch =
        itSwitches[Math.min(switchIndex, itSwitches.length - 1)];

      // Calculate the port on this specific switch (1-14)
      const portOnSwitch = (index % devicesPerSwitch) + 1;

      links.push({
        nodes: [
          { node_id: device.node_id, adapter_number: 0, port_number: 0 },
          {
            node_id: targetSwitch.node_id,
            adapter_number: portOnSwitch,
            port_number: 0,
          },
        ],
      });
    });
  }

  // Connect OT devices to OT switches - evenly distributed
  if (otSwitches.length > 0) {
    const devicesPerSwitch = Math.ceil(otDevices.length / otSwitches.length);

    otDevices.forEach((device, index) => {
      // Calculate which switch based on even distribution
      const switchIndex = Math.floor(index / devicesPerSwitch);
      const targetSwitch =
        otSwitches[Math.min(switchIndex, otSwitches.length - 1)];

      // Calculate the port on this specific switch (1-14)
      const portOnSwitch = (index % devicesPerSwitch) + 1;

      links.push({
        nodes: [
          { node_id: device.node_id, adapter_number: 0, port_number: 0 },
          {
            node_id: targetSwitch.node_id,
            adapter_number: portOnSwitch,
            port_number: 0,
          },
        ],
      });
    });
  }

  // Connect all switches to firewall(s)
  if (firewalls.length > 0) {
    const firewall = firewalls[0]; // Use first firewall
    let firewallPort = 0;

    // Connect IT switches to firewall
    itSwitches.forEach((itSwitch) => {
      links.push({
        nodes: [
          {
            node_id: itSwitch.node_id,
            adapter_number: 0, // Use port 0 as uplink port
            port_number: 0,
          },
          {
            node_id: firewall.node_id,
            adapter_number: firewallPort,
            port_number: 0,
          },
        ],
      });
      firewallPort++;
    });

    // Connect OT switches to firewall
    otSwitches.forEach((otSwitch) => {
      links.push({
        nodes: [
          {
            node_id: otSwitch.node_id,
            adapter_number: 0, // Use port 0 as uplink port
            port_number: 0,
          },
          {
            node_id: firewall.node_id,
            adapter_number: firewallPort,
            port_number: 0,
          },
        ],
      });
      firewallPort++;
    });
  }

  return links;
};

export const generateTopologyJSON = (
  itDevices: DeviceConfig[],
  otDevices: DeviceConfig[],
  firewallConfig: DeviceConfig,
  templates: Template[],
  selectedProject: Project | null
) => {
  const nodes: Node[] = [];
  const links: Link[] = [];
  let nodeId = 1;

  // Extract GNS3 server IP from environment variable
  const gns3Url =
    process.env.NEXT_PUBLIC_GNS3_URL || "http://192.168.56.102:80/v2";
  const gns3ServerIp = gns3Url
    .replace(/^https?:\/\//, "")
    .replace(/:\d+.*$/, "");

  const addDevices = (devices: DeviceConfig[], zone: "IT" | "OT") => {
    devices.forEach((device) => {
      if (device.count > 0) {
        for (let i = 0; i < device.count; i++) {
          nodes.push({
            node_id: `${device.name}_${i + 1}`,
            name: `${device.name}_${i + 1}`,
            template_id: device.templateId,
            x: 0, // Temporary position - will be calculated later
            y: 0, // Temporary position - will be calculated later
            zone: zone,
          });
          nodeId++;
        }
      }
    });
  };

  // Add IT devices
  addDevices(itDevices, "IT");

  // Add OT devices
  addDevices(otDevices, "OT");

  // Add firewall
  if (firewallConfig.count > 0) {
    for (let i = 0; i < firewallConfig.count; i++) {
      nodes.push({
        node_id: `Firewall_${i + 1}`,
        name: `Firewall_${i + 1}`,
        template_id: firewallConfig.templateId,
        x: 0, // Will be positioned at center
        y: 0, // Will be positioned at center
        zone: "DMZ",
      });
    }
  }

  // Calculate hierarchical positions for all nodes
  const positionedNodes = calculateHierarchicalPositions(nodes);

  // Generate links with the positioned nodes
  const generatedLinks = generateBasicLinks(positionedNodes);
  links.push(...generatedLinks);

  // Build templates object from current templates
  const templatesObj: Record<string, string> = {};
  templates.forEach((template) => {
    templatesObj[template.name] = template.template_id;
  });

  const scenario = {
    gns3_server_ip: gns3ServerIp,
    project_name: selectedProject?.name || "ae3gis",
    project_id:
      selectedProject?.project_id || "391a9fde-246c-4473-9024-202ff316c48a",
    templates: templatesObj,
    topology_type: "HYBRID",
    created_at: new Date().toISOString(),
    nodes: positionedNodes, // Use positioned nodes instead of original nodes
    links,
  };

  return scenario;
};

export const downloadJSON = (jsonData: any, filename: string = "topology") => {
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().getTime()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
