// src/components/ThemeSwitch.jsx
import { FiMoon, FiSun } from "react-icons/fi";
import { useUIStore } from "../store/uiStore";

export default function ThemeSwitch() {
    const { theme, setTheme } = useUIStore();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <button
            onClick={toggleTheme}
            className="btn-ghost text-lg"
            aria-label="Basculer le thème"
        >
            {theme === "dark" ? <FiSun /> : <FiMoon />}
        </button>
    );
}
