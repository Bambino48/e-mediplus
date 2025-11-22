// src/components/Toast.jsx
import { useEffect } from "react";

export default function Toast({ type = "success", message, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => onClose?.(), 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = {
        success: "bg-green-100 text-green-700 border-green-300",
        error: "bg-red-100 text-red-700 border-red-300",
        warning: "bg-yellow-100 text-yellow-700 border-yellow-300",
        info: "bg-blue-100 text-blue-700 border-blue-300",
    };

    return (
        <div
            className={`fixed top-4 right-4 border px-4 py-2 rounded-md shadow-sm text-sm animate-fade-in ${colors[type]}`}
            role="alert"
        >
            {message}
        </div>
    );
}
