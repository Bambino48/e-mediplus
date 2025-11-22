import {
  BarChart3,
  Brain,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  Home,
  Hospital,
  Pill,
  Search,
  Settings,
  Shield,
  Stethoscope,
  User,
  Users,
  Video,
} from "lucide-react";
import { Fragment } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { usePatientUpcomingAppointments } from "../hooks/usePatientDashboard.js";
import { useUIStore } from "../store/uiStore.js";

const baseLink =
  "flex items-center gap-2 px-3 py-2 rounded-xl text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition";
const active =
  "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-200";

export default function Sidebar({
  section = "patient",
  className = "",
  setActiveView,
  activeView,
}) {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const groups = getGroupsBySection(section);

  // ✅ Hook pour récupérer les rendez-vous à venir (seulement pour les patients)
  const isPatient = section === "patient";
  const upcomingAppointmentsQuery = usePatientUpcomingAppointments();
  const upcomingAppointments = isPatient
    ? upcomingAppointmentsQuery.data
    : null;

  const handleClick = (item) => {
    if (setActiveView) setActiveView(item.key);
  };

  // ✅ Gestionnaire spécial pour "Trouver un pro"
  const handleSearchClick = (e) => {
    e.preventDefault();
    console.log("🔍 Sidebar - Clic sur 'Trouver un pro'");

    // Si on utilise le système de vues (DashboardContainer)
    if (setActiveView) {
      console.log("🔍 Utilisation de setActiveView pour afficher la recherche");
      setActiveView("search");
    } else {
      // Sinon, navigation classique vers /search
      console.log("🔍 Navigation vers /search");
      navigate("/search");
    }
  };

  // ✅ Résolution de la photo de profil (utilise photo_url en priorité)
  const resolvePhoto = () => {
    if (user?.photo_url) return user.photo_url;

    if (user?.photo && user.photo.trim() !== "") {
      if (user.photo.startsWith("http")) return user.photo;
      if (user.photo.startsWith("data:image")) return user.photo;
      return `${
        import.meta.env.VITE_API_URL || "http://localhost:8000"
      }/storage/${user.photo}`;
    }

    return "https://cdn-icons-png.flaticon.com/512/847/847969.png";
  };

  const photoUrl = resolvePhoto();

  return (
    <aside
      className={`sticky top-0 flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 h-screen ${
        sidebarOpen ? "min-w-64 w-64" : "w-20"
      } ${className}`}
    >
      {/* === Haut : Photo (toujours visible) === */}
      <div className="p-3 shrink-0">
        {/* ✅ Photo (toujours visible, mais adaptée à la taille) */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={photoUrl}
              alt="Profil"
              className={`rounded-full object-cover border-4 border-cyan-500 shadow-lg transition-all duration-300 hover:scale-105 ${
                sidebarOpen ? "h-24 w-24" : "h-12 w-12"
              }`}
              onError={(e) => {
                console.log("Erreur chargement photo:", photoUrl);
                e.target.src =
                  "https://cdn-icons-png.flaticon.com/512/847/847969.png";
              }}
            />
          </div>
          {sidebarOpen && (
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200 text-center truncate max-w-40">
              {user?.name || "Utilisateur"}
            </p>
          )}
        </div>
      </div>

      {/* === Milieu : Navigation === */}
      <div className="flex-1 p-3">
        <nav>
          {groups.map((g) => (
            <Fragment key={g.title}>
              {sidebarOpen && (
                <div className="px-1 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {g.title}
                </div>
              )}
              <div className="mt-1 space-y-1">
                {g.items.map((it) => {
                  const isActive = activeView === it.key || false;

                  // ✅ Traitement spécial pour "Trouver un pro" (toujours)
                  if (it.key === "search") {
                    return (
                      <button
                        key={it.key}
                        onClick={handleSearchClick}
                        className={`${baseLink} text-slate-700 dark:text-slate-200 w-full text-left`}
                        title={it.label}
                      >
                        <span className="text-lg">{it.icon}</span>
                        <span className={`${sidebarOpen ? "" : "hidden"}`}>
                          {it.label}
                        </span>
                      </button>
                    );
                  }

                  return setActiveView ? (
                    <div
                      key={it.key}
                      onClick={() => handleClick(it)}
                      className={`${baseLink} ${
                        isActive ? active : "text-slate-700 dark:text-slate-200"
                      } ${
                        it.key === "appointments" && section === "patient"
                          ? "relative"
                          : ""
                      }`}
                      title={it.label}
                    >
                      <span className="text-lg relative">
                        {it.icon}
                        {it.key === "appointments" &&
                          section === "patient" &&
                          upcomingAppointments?.appointments?.length > 0 && (
                            <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"></span>
                          )}
                      </span>
                      <span className={`${sidebarOpen ? "" : "hidden"}`}>
                        {it.label}
                      </span>
                    </div>
                  ) : (
                    <NavLink
                      key={it.to}
                      to={it.to}
                      className={({ isActive }) =>
                        `${baseLink} ${
                          isActive
                            ? active
                            : "text-slate-700 dark:text-slate-200"
                        } ${
                          it.key === "appointments" && section === "patient"
                            ? "relative"
                            : ""
                        }`
                      }
                      title={it.label}
                    >
                      <span className="text-lg relative">
                        {it.icon}
                        {it.key === "appointments" &&
                          section === "patient" &&
                          upcomingAppointments?.appointments?.length > 0 && (
                            <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"></span>
                          )}
                      </span>
                      <span className={`${sidebarOpen ? "" : "hidden"}`}>
                        {it.label}
                      </span>
                    </NavLink>
                  );
                })}
              </div>
            </Fragment>
          ))}
        </nav>
      </div>

      {/* === Bas : Bouton réduire/agrandir la sidebar === */}
      <div className="sticky bottom-0 left-0 w-full p-3 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 transition"
          title={sidebarOpen ? "Réduire la sidebar" : "Agrandir la sidebar"}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          ) : (
            <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          )}
        </button>
      </div>
    </aside>
  );
}

/**
 * ✅ Liste des groupes par type d'utilisateur
 */
function getGroupsBySection(section) {
  if (section === "pro") {
    return [
      {
        title: "Pratique",
        items: [
          {
            key: "dashboard",
            to: "/pro/dashboard",
            label: "Dashboard",
            icon: <BarChart3 size={18} />,
          },
          {
            key: "calendar",
            to: "/pro/calendar",
            label: "Calendrier",
            icon: <CalendarDays size={18} />,
          },
          {
            key: "availabilities",
            to: "/pro/availabilities",
            label: "Disponibilités",
            icon: <CalendarDays size={18} />,
          },
          {
            key: "patients",
            to: "/pro/patients",
            label: "Mes patients",
            icon: <Users size={18} />,
          },
          {
            key: "prescriptions",
            to: "/pro/prescriptions",
            label: "Prescriptions",
            icon: <FileText size={18} />,
          },
          {
            key: "teleconsult",
            to: "/pro/teleconsult",
            label: "Téléconsultation",
            icon: <Video size={18} />,
          },
        ],
      },
      {
        title: "Compte",
        items: [
          {
            key: "profile",
            to: "/pro/profile",
            label: "Profil",
            icon: <Stethoscope size={18} />,
          },
          {
            key: "settings",
            to: "/pro/settings",
            label: "Paramètres",
            icon: <Settings size={18} />,
          },
          {
            key: "billing",
            to: "/pro/billing",
            label: "Revenus",
            icon: <DollarSign size={18} />,
          },
        ],
      },
    ];
  }

  if (section === "admin") {
    return [
      {
        title: "Pilotage",
        items: [
          {
            key: "dashboard",
            to: "/admin/dashboard",
            label: "Dashboard",
            icon: <BarChart3 size={18} />,
          },
          {
            key: "users",
            to: "/admin/users",
            label: "Utilisateurs",
            icon: <Users size={18} />,
          },
          {
            key: "catalog",
            to: "/admin/catalog",
            label: "Catalogue santé",
            icon: <Hospital size={18} />,
          },
          {
            key: "monetization",
            to: "/admin/monetization",
            label: "Monétisation",
            icon: <DollarSign size={18} />,
          },
          {
            key: "reports",
            to: "/admin/reports",
            label: "Rapports",
            icon: <FileText size={18} />,
          },
          {
            key: "moderation",
            to: "/admin/moderation",
            label: "Modération",
            icon: <Shield size={18} />,
          },
          {
            key: "settings",
            to: "/admin/settings",
            label: "Paramètres",
            icon: <Settings size={18} />,
          },
        ],
      },
    ];
  }

  // ✅ Patient par défaut
  return [
    {
      title: "Patient",
      items: [
        {
          key: "dashboard",
          to: "/patient/dashboard",
          label: "Tableau de bord",
          icon: <Home size={18} />,
        },
        {
          key: "search",
          to: "/search",
          label: "Trouver un pro",
          icon: <Search size={18} />,
        },
        {
          key: "appointments",
          to: "/patient/appointments",
          label: "Mes rendez-vous",
          icon: <CalendarDays size={18} />,
        },
        {
          key: "teleconsult",
          to: "/teleconsult",
          label: "Téléconsultation",
          icon: <Video size={18} />,
        },
        {
          key: "triage",
          to: "/triage",
          label: "Triage IA",
          icon: <Brain size={18} />,
        },
        {
          key: "prescriptions",
          to: "/patient/prescriptions",
          label: "Ordonnances",
          icon: <Pill size={18} />,
        },
        {
          key: "profile",
          to: "/patient/profile",
          label: "Mon profil",
          icon: <User size={18} />,
        },
      ],
    },
  ];
}
