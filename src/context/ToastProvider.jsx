import { createContext, useContext } from "react";
import { ToastContainer } from "../components/ToastNotification.jsx";
import { useToast } from "../hooks/useToast.js";

const ToastContext = createContext();

export const useToastContext = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToastContext must be used within a ToastProvider");
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const toastLogic = useToast();

    return (
        <ToastContext.Provider value={toastLogic}>
            {children}
            <ToastContainer
                toasts={toastLogic.toasts}
                onClose={toastLogic.removeToast}
            />
        </ToastContext.Provider>
    );
};