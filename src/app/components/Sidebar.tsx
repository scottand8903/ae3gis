// import Link from "next/link";

// export default function Sidebar() {
//   return (
//     <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
//       <h1 className="text-2xl font-bold mb-6">MyApp</h1>
//       <nav className="flex flex-col gap-4">
//         <Link href="/" className="hover:bg-gray-700 p-2 rounded">
//           Dashboard
//         </Link>
//         <Link href="/settings" className="hover:bg-gray-700 p-2 rounded">
//           Settings
//         </Link>
//         <Link href="/profile" className="hover:bg-gray-700 p-2 rounded">
//           Profile
//         </Link>
//       </nav>
//     </aside>
//   );
// }

"use client"; // needed in Next.js App Router
import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react"; // pnpm add lucide-react
import SidebarItem from "./SidebarItem";

export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // toggle function
  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-6">MyApp</h1>

      <nav className="flex flex-col gap-2">
        {/* Scenario */}
        <button
          onClick={() => toggleMenu("dashboard")}
          className="flex items-center justify-between hover:bg-gray-700 p-2 rounded"
        >
          <span>Scenario Builder</span>
          {openMenu === "dashboard" ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>
        {openMenu === "dashboard" && (
          <div className="ml-4 flex flex-col gap-1">
            <SidebarItem name="Apache-server" />
            <SidebarItem name="iptables" />
            <SidebarItem name="Malicious-client" />
            <SidebarItem name="Benign-client" />
            <SidebarItem name="isc-dhcp-server" />
            <SidebarItem name="isc-dhcp-server-amd" />
            <SidebarItem name="Openvswitch-xp" />
            <SidebarItem name="firehol-xp" />
            <SidebarItem name="nftables-xp" />
            <SidebarItem name="Wazuh-manager-amd" />
            <SidebarItem name="Wazuh-agent-amd" />
            <SidebarItem name="Wazun-manager" />
          </div>
        )}

        {/* Scenario's */}
        <button
          onClick={() => toggleMenu("settings")}
          className="flex items-center justify-between hover:bg-gray-700 p-2 rounded"
        >
          <span>Scenarios</span>
          {openMenu === "settings" ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>
        {openMenu === "settings" && (
          <div className="ml-4 flex flex-col gap-1">
            <Link href="/profile" className="hover:bg-gray-700 p-2 rounded">
              Stuxnet
            </Link>
            <Link href="/account" className="hover:bg-gray-700 p-2 rounded">
              Other Scenario
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
