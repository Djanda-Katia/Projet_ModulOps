import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden font-sans antialiased relative">
      
      {/* Overlay pour mobile */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setSidebarOpen(false)}
      />
      
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Zone de droite */}
      <div className="flex flex-col flex-1 h-full overflow-hidden w-full">
        <Header toggleSidebar={toggleSidebar} />
        
        {/* ← Permet le défilement horizontal sur mobile */}
        <main className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-8 w-full">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}