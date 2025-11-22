/* eslint-disable no-unused-vars */
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import {
  Globe,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [locale, setLocale] = useState(
    () => localStorage.getItem("locale") || "fr"
  );
  const [isScrolled, setIsScrolled] = useState(false);

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
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
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

  // Variantes d’animation de la navbar
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
        darkMode
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
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
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
              animate={{ color: darkMode ? "#06b6d4" : "#0ea5e9" }}
              transition={{ duration: 0.5 }}
            >
              Medi
            </motion.span>
            <motion.span
              animate={{ color: darkMode ? "#14b8a6" : "#06b6d4" }}
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
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Changer le thème"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Langue */}
          <button
            onClick={toggleLang}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Changer la langue"
            title={`Langue actuelle : ${locale.toUpperCase()}`}
          >
            <Globe className="h-5 w-5" />
            <span className="text-xs">{locale.toUpperCase()}</span>
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
            <div className="flex items-center gap-2">
              {/* Indicateur de rôle sur dashboard */}
              {isOnDashboard && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 border border-cyan-200 dark:border-cyan-800">
                  <User className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 capitalize">
                    {user.role === "admin"
                      ? "Administrateur"
                      : user.role === "patient"
                      ? "Patient"
                      : "Professionnel"}
                  </span>
                </div>
              )}
              {!isOnDashboard && (
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
              )}

              {/* Bouton retour à l'accueil si sur dashboard (desktop) */}
              {isOnDashboard && (
                <Link
                  to="/"
                  className="hidden sm:flex btn-secondary items-center gap-1"
                >
                  <LayoutDashboard className="h-4 w-4" /> Accueil
                </Link>
              )}

              {/* ✅ Correction : déconnexion avec redirection */}
              <button
                onClick={async () => {
                  await logout();
                  navigate("/"); // ✅ Redirige vers la page d’accueil
                }}
                className="btn-ghost flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" /> Déconnexion
              </button>
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
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                {/* Indicateur de rôle mobile */}
                {isOnDashboard && (
                  <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 border border-cyan-200 dark:border-cyan-800">
                    <User className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    <span className="text-sm font-semibold text-cyan-700 dark:text-cyan-300 capitalize">
                      {user.role === "admin"
                        ? "Administrateur"
                        : user.role === "patient"
                        ? "Patient"
                        : "Professionnel"}
                    </span>
                  </div>
                )}

                {/* Bouton retour à l'accueil si sur dashboard */}
                {isOnDashboard && (
                  <Link
                    to="/"
                    className="btn-secondary w-full flex items-center justify-center gap-1"
                    onClick={() => setMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" /> Retour à l'accueil
                  </Link>
                )}

                {/* Bouton déconnexion */}
                <button
                  onClick={async () => {
                    setMenuOpen(false);
                    await logout();
                    navigate("/"); // ✅ Redirige aussi sur mobile
                  }}
                  className="btn-ghost w-full flex items-center justify-center gap-1"
                >
                  <LogOut className="h-4 w-4" /> Déconnexion
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
        `block text-sm px-3 py-2 rounded-md transition-colors duration-200 ${
          isActive
            ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-200"
            : "text-slate-700 dark:text-slate-200 hover:text-cyan-600"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
