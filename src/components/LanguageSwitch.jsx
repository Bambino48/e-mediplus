// src/components/LanguageSwitch.jsx
import { FiGlobe } from "react-icons/fi";
import { useEffect } from "react";
import { useUIStore } from "../store/uiStore.js";

export default function LanguageSwitch() {
    const locale = useUIStore((s) => s.locale);
    const setLocale = useUIStore((s) => s.setLocale);

    useEffect(() => {
        document.documentElement.lang = locale;
        localStorage.setItem("locale", locale);
    }, [locale]);

    const toggle = () => setLocale(locale === "fr" ? "en" : "fr");

    return (
        <button
            onClick={toggle}
            className="btn-ghost flex items-center gap-2"
            aria-label="Changer la langue"
            title={`Langue: ${locale.toUpperCase()} (cliquer pour basculer)`}
        >
            <FiGlobe />
            <span className="text-xs">{locale.toUpperCase()}</span>
        </button>
    );
}
