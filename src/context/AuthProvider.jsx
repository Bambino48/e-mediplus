// src/context/AuthProvider.jsx
import { useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

export default function AuthProvider({ children }) {
  const { fetchCurrentUser } = useAuth();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Éviter les appels multiples en mode développement React
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      // Délai pour éviter les appels répétés
      const timer = setTimeout(() => {
        fetchCurrentUser();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [fetchCurrentUser]);

  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
}

