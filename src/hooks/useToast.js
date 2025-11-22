import { useCallback, useState } from "react";

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: "info",
      duration: 5000,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message, title = "Succès") => {
      return addToast({ type: "success", title, message });
    },
    [addToast]
  );

  const showError = useCallback(
    (message, title = "Erreur") => {
      return addToast({ type: "error", title, message });
    },
    [addToast]
  );

  const showWarning = useCallback(
    (message, title = "Avertissement") => {
      return addToast({ type: "warning", title, message });
    },
    [addToast]
  );

  const showInfo = useCallback(
    (message, title = "Information") => {
      return addToast({ type: "info", title, message });
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
