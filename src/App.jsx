// src/App.jsx
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Footer from "./components/Footer.jsx";
import Navbar from "./components/Navbar.jsx";
import AuthProvider from "./context/AuthProvider.jsx";
import { ThemeProvider } from "./context/ThemeProvider.jsx";
import { ToastProvider } from "./context/ToastProvider.jsx";
import { useAuth } from "./hooks/useAuth.js";
import AppRouter from "./router/AppRouter.jsx";

// ✅ Ce composant gère la récupération de l'utilisateur après AuthProvider
function AuthInitializer({ children }) {
  const { fetchCurrentUser } = useAuth();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return children;
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* ✅ ThemeProvider pour la gestion globale du thème */}
      <ThemeProvider>
        {/* ✅ AuthProvider doit entourer tout le reste */}
        <AuthProvider>
          {/* ✅ ToastProvider pour les notifications personnalisées */}
          <ToastProvider>
            {/* ✅ AuthInitializer déclenche la récupération du user connecté */}
            <AuthInitializer>
              <Navbar />

              <ErrorBoundary>
                <main className="flex-1 pt-20">
                  <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <AppRouter />
                  </div>
                </main>
              </ErrorBoundary>

              <Footer />
            </AuthInitializer>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}

