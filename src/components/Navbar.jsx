/* eslint-disable no-unused-vars */
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import {
  ChevronDown,
  Globe,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
  UserCircle,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUIStore } from "../store/uiStore.js";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [locale, setLocale] = useState(
    () => localStorage.getItem("locale") || "fr"
  );
  const [isScrolled, setIsScrolled] = useState(false);

  // Utiliser le store Zustand pour le thème
  const { theme, setTheme } = useUIStore();

  // Détecter si l'utilisateur est sur un dashboard
  const isOnDashboard =
    location.pathname.includes("/dashboard") ||
    location.pathname.startsWith("/patient/") ||
    location.pathname.startsWith("/pro/") ||
    location.pathname.startsWith("/admin/");

  // Animation de compactage au scroll
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 30);
  });

  // Thème clair/sombre
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Langue persistante FR/EN
  const toggleLang = () => {
    const next = locale === "fr" ? "en" : "fr";
    setLocale(next);
    localStorage.setItem("locale", next);
    document.documentElement.lang = next;
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // Fermer le menu utilisateur quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuOpen && !e.target.closest(".user-menu-container")) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [userMenuOpen]);

  // Variantes d'animation de la navbar
  const variants = {
    initial: { height: 80, backgroundColor: "rgba(255,255,255,0.85)" },
    scrolled: {
      height: 64,
      backgroundColor: "rgba(255,255,255,0.9)",
      transition: { duration: 0.3 },
    },
    darkInitial: { height: 80, backgroundColor: "rgba(15,23,42,0.85)" },
    darkScrolled: {
      height: 64,
      backgroundColor: "rgba(15,23,42,0.9)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.header
      className="fixed top-0 left-0 w-full z-50 backdrop-blur border-b border-slate-200 dark:border-slate-800"
      animate={
        theme === "dark"
          ? isScrolled
            ? "darkScrolled"
            : "darkInitial"
          : isScrolled
            ? "scrolled"
            : "initial"
      }
      variants={variants}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* === LOGO === */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Ouvrir le menu"
          >
            {menuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          <Link
            to="/"
            className="font-semibold text-xl tracking-tight hover:opacity-90 transition"
          >
            <motion.span
              animate={{ color: theme === "dark" ? "#06b6d4" : "#0ea5e9" }}
              transition={{ duration: 0.5 }}
            >
              Medi
            </motion.span>
            <motion.span
              animate={{ color: theme === "dark" ? "#14b8a6" : "#06b6d4" }}
              transition={{ duration: 0.5 }}
            >
              Plus
            </motion.span>
          </Link>

          {/* === NAVIGATION PRINCIPALE === */}
          {!isOnDashboard && (
            <div className="hidden md:flex items-center gap-6 ml-6">
              <NavItem to="/" label="Accueil" />
              <NavItem to="/search" label="Trouver" />
              <NavItem to="/pricing" label="Tarifs" />
              <NavItem to="/about" label="À propos" />
              <NavItem to="/contact" label="Contact" />
            </div>
          )}
        </div>

        {/* === ACTIONS === */}
        <div className="flex items-center gap-2">
          {/* Thème */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Changer le thème"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Langue */}
          <button
            onClick={toggleLang}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Changer la langue"
            title={`Langue actuelle : ${locale.toUpperCase()}`}
          >
            <Globe className="h-5 w-5" />
            <span className="text-xs font-medium">{locale.toUpperCase()}</span>
          </button>

          {/* Auth / Dashboard */}
          {!user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="btn-secondary flex items-center gap-1"
              >
                <LogIn className="h-4 w-4" /> Connexion
              </Link>
              <Link to="/register" className="btn-primary">
                S'inscrire
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* === MODE DASHBOARD PROFESSIONNEL === */}
              {isOnDashboard ? (
                <>
                  {/* Badge utilisateur avec nom + rôle */}
                  <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-linear-to-r from-cyan-50 via-blue-50 to-cyan-50 dark:from-cyan-900/30 dark:via-blue-900/30 dark:to-cyan-900/30 border border-cyan-200 dark:border-cyan-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-1.5 rounded-lg bg-linear-to-br from-cyan-500 to-blue-600">
                      <UserCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                        {user.email?.split("@")[0] || "Utilisateur"}
                      </span>
                      <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold capitalize leading-tight">
                        {user.role === "admin"
                          ? "Administrateur"
                          : user.role === "patient"
                            ? "Patient"
                            : "Professionnel"}
                      </span>
                    </div>
                  </div>

                  {/* Bouton Retour Accueil */}
                  <Link
                    to="/"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:border-cyan-300 dark:hover:border-cyan-600 text-sm font-medium text-slate-700 dark:text-slate-300"
                    title="Retour à l'accueil"
                  >
                    <Home className="h-4 w-4" />
                    <span className="hidden lg:inline">Accueil</span>
                  </Link>

                  {/* Menu utilisateur avec dropdown */}
                  <div className="relative user-menu-container">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      aria-label="Menu utilisateur"
                    >
                      <User className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                      <ChevronDown
                        className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>

                    {/* Dropdown menu */}
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50"
                      >
                        {/* Header du menu avec info utilisateur */}
                        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-linear-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-linear-to-br from-cyan-500 to-blue-600">
                              <UserCircle className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                {user.email?.split("@")[0] || "Utilisateur"}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-40">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions du menu */}
                        <div className="py-2">
                          <Link
                            to={
                              user.role === "admin"
                                ? "/admin/dashboard"
                                : user.role === "patient"
                                  ? "/patient/dashboard"
                                  : "/pro/dashboard"
                            }
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                            <span>Tableau de bord</span>
                          </Link>

                          <Link
                            to={
                              user.role === "admin"
                                ? "/admin/settings"
                                : user.role === "patient"
                                  ? "/patient/profile"
                                  : "/pro/settings"
                            }
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Settings className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            <span>Paramètres</span>
                          </Link>

                          <div className="border-t border-slate-200 dark:border-slate-800 my-2"></div>

                          <button
                            onClick={async () => {
                              setUserMenuOpen(false);
                              await logout();
                              navigate("/");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Déconnexion</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Mode navigation publique avec utilisateur connecté */}
                  <Link
                    to={
                      user.role === "admin"
                        ? "/admin/dashboard"
                        : user.role === "patient"
                          ? "/patient/dashboard"
                          : "/pro/dashboard"
                    }
                    className="btn-secondary flex items-center gap-1"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>

                  <button
                    onClick={async () => {
                      await logout();
                      navigate("/");
                    }}
                    className="btn-ghost flex items-center gap-1"
                  >
                    <LogOut className="h-4 w-4" /> Déconnexion
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* === MENU MOBILE === */}
      {menuOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm"
        >
          <div className="px-4 py-3 flex flex-col gap-3">
            {/* Liens publics uniquement si pas sur dashboard */}
            {!isOnDashboard && (
              <>
                <MobileItem
                  to="/"
                  label="Accueil"
                  onClick={() => setMenuOpen(false)}
                />
                <MobileItem
                  to="/search"
                  label="Trouver"
                  onClick={() => setMenuOpen(false)}
                />
                <MobileItem
                  to="/pricing"
                  label="Tarifs"
                  onClick={() => setMenuOpen(false)}
                />
                <MobileItem
                  to="/about"
                  label="À propos"
                  onClick={() => setMenuOpen(false)}
                />
                <MobileItem
                  to="/contact"
                  label="Contact"
                  onClick={() => setMenuOpen(false)}
                />
              </>
            )}

            {!user ? (
              <div className="flex gap-2 pt-2">
                <Link
                  to="/login"
                  className="btn-secondary flex-1 flex items-center justify-center gap-1"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="h-4 w-4" /> Connexion
                </Link>
                <Link
                  to="/register"
                  className="btn-primary flex-1 flex items-center justify-center"
                  onClick={() => setMenuOpen(false)}
                >
                  S'inscrire
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                {/* Badge utilisateur mobile */}
                {isOnDashboard && (
                  <div className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-linear-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 border border-cyan-200 dark:border-cyan-800">
                    <div className="p-2 rounded-lg bg-linear-to-br from-cyan-500 to-blue-600">
                      <UserCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {user.email?.split("@")[0] || "Utilisateur"}
                      </span>
                      <span className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold capitalize">
                        {user.role === "admin"
                          ? "Administrateur"
                          : user.role === "patient"
                            ? "Patient"
                            : "Professionnel"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Navigation mobile dashboard */}
                {isOnDashboard && (
                  <>
                    <Link
                      to={
                        user.role === "admin"
                          ? "/admin/dashboard"
                          : user.role === "patient"
                            ? "/patient/dashboard"
                            : "/pro/dashboard"
                      }
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Tableau de bord</span>
                    </Link>

                    <Link
                      to={
                        user.role === "admin"
                          ? "/admin/settings"
                          : user.role === "patient"
                            ? "/patient/profile"
                            : "/pro/settings"
                      }
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Paramètres</span>
                    </Link>

                    <Link
                      to="/"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Home className="h-4 w-4" />
                      <span>Retour à l'accueil</span>
                    </Link>
                  </>
                )}

                {/* Bouton déconnexion */}
                <button
                  onClick={async () => {
                    setMenuOpen(false);
                    await logout();
                    navigate("/");
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-red-200 dark:border-red-800"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

/* === LIENS PRINCIPAUX AVEC ANIMATION PREMIUM === */
function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative text-sm font-medium tracking-wide transition-colors duration-200 
        ${isActive ? "text-cyan-600" : "text-slate-700 dark:text-slate-300"} 
        hover:text-cyan-600 after:absolute after:left-0 after:-bottom-1 
        after:h-0.5 after:w-0 after:bg-linear-to-r after:from-teal-400 after:to-cyan-500
        hover:after:w-full after:transition-all after:duration-300`
      }
    >
      {label}
    </NavLink>
  );
}

/* === LIENS MOBILE === */
function MobileItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `block text-sm px-3 py-2 rounded-md transition-colors duration-200 ${isActive
          ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-200"
          : "text-slate-700 dark:text-slate-200 hover:text-cyan-600"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
