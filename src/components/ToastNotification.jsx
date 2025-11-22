/* eslint-disable no-unused-vars */
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { useEffect } from "react";

const ToastNotification = ({
    id,
    type = "info",
    title,
    message,
    duration = 5000,
    onClose,
}) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose(id);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [id, duration, onClose]);

    const icons = {
        success: <CheckCircle className="h-5 w-5 text-green-500" />,
        error: <AlertCircle className="h-5 w-5 text-red-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
    };

    const backgrounds = {
        success:
            "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
        error: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
        warning:
            "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
        info: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.3 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
            className={`flex items-start p-4 mb-4 rounded-lg border shadow-lg ${backgrounds[type]} dark:text-white`}
        >
            <div className="shrink-0 mr-3">{icons[type]}</div>
            <div className="flex-1 min-w-0">
                {title && (
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {title}
                    </p>
                )}
                <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
            </div>
            <div className="shrink-0 ml-3">
                <button
                    onClick={() => onClose(id)}
                    className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </motion.div>
    );
};

const ToastContainer = ({ toasts, onClose }) => {
    return (
        <div className="fixed top-4 right-4 z-50 w-96 max-w-sm">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastNotification key={toast.id} {...toast} onClose={onClose} />
                ))}
            </AnimatePresence>
        </div>
    );
};

export { ToastContainer, ToastNotification };
