// src/pages/patient/DashboardContainer.jsx
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Sidebar from "../../components/Sidebar.jsx";
import { useUIStore } from "../../store/uiStore.js";
import Appointments from "./Appointments.jsx";
import Booking from "./Booking.jsx";
import PatientDashboard from "./Dashboard.jsx";
import Prescriptions from "./Prescriptions.jsx";
import PatientProfile from "./Profile.jsx";
import Search from "./Search.jsx";
import Teleconsult from "./Teleconsult.jsx";
import Triage from "./Triage.jsx";

export default function DashboardContainer() {
  const [activeView, setActiveView] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { sidebarOpen, setSidebar } = useUIStore();

  // La sidebar peut maintenant être réduite/agrandie par l'utilisateur
  // useEffect(() => {
  //   if (!sidebarOpen) {
  //     setSidebar(true);
  //   }
  // }, [sidebarOpen, setSidebar]);

  const handleViewChange = (view) => {
    setActiveView(view);
    setMobileMenuOpen(false); // Ferme le menu mobile après sélection
  };

  // Dictionnaire des composants internes
  const views = {
    dashboard: <PatientDashboard setActiveView={handleViewChange} />,
    search: <Search />,
    profile: <PatientProfile />,
    teleconsult: <Teleconsult />,
    triage: <Triage />,
    prescriptions: <Prescriptions />,
    appointments: <Appointments useLayout={false} />,
    booking: <Booking />,
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Bouton hamburger mobile (visible uniquement sur mobile) */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-slate-800 shadow-lg md:hidden hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6 text-slate-700 dark:text-slate-200" />
        ) : (
          <Menu className="h-6 w-6 text-slate-700 dark:text-slate-200" />
        )}
      </button>

      {/* Overlay backdrop pour mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ✅ Sidebar toujours visible sur desktop, gère sa propre largeur */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <Sidebar
          section="patient"
          setActiveView={handleViewChange}
          activeView={activeView}
          className="h-full border-r border-slate-200 dark:border-slate-800"
        />
      </div>

      {/* ✅ Zone principale dynamique avec padding pour le bouton hamburger mobile */}
      <main className="flex-1 p-6 pt-20 md:pt-6 overflow-y-auto transition-all duration-300">
        {views[activeView] || <PatientDashboard />}
      </main>
    </div>
  );
}
