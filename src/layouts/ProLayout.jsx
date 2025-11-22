// src/layouts/ProLayout.jsx
import { useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { useUIStore } from "../store/uiStore.js";

export default function ProLayout({ children, title }) {
  const { sidebarOpen, setSidebar } = useUIStore();

  // S'assurer que la sidebar est ouverte par défaut dans tous les dashboards pro
  useEffect(() => {
    if (!sidebarOpen) {
      setSidebar(true);
    }
  }, [sidebarOpen, setSidebar]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* === Sidebar === */}
      <Sidebar
        section="pro"
        className="shrink-0 border-r border-slate-200 dark:border-slate-800"
      />

      {/* === Contenu principal === */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
        {title && (
          <h1 className="text-2xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
            {title}
          </h1>
        )}
        {children}
      </main>
    </div>
  );
}
