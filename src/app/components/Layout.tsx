import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 p-6 bg-gray-700 text-white min-h-screen">
        {children}
      </main>
    </div>
  );
}
