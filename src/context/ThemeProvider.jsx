// src/context/ThemeProvider.jsx
import { useEffect } from "react";
import { useUIStore } from "../store/uiStore";

export function ThemeProvider({ children }) {
    const { theme, setTheme } = useUIStore();

    // Appliquer le thème au document au montage et quand il change
    useEffect(() => {
        const root = document.documentElement;

        // Appliquer la classe dark selon le thème
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        // Sauvegarder dans localStorage
        localStorage.setItem("theme", theme);
    }, [theme]);

    // Initialiser le thème au montage du composant
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "light";
        setTheme(savedTheme);
    }, [setTheme]);

    return children;
}