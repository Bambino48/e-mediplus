import { useToastContext } from "../context/ToastProvider.jsx";

// Hook unifié pour les toasts - utilise le système personnalisé
export const useAppToast = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToastContext();

  return {
    success: (message, title = "Succès") => showSuccess(message, title),
    error: (message, title = "Erreur") => showError(message, title),
    warning: (message, title = "Avertissement") => showWarning(message, title),
    info: (message, title = "Information") => showInfo(message, title),

    // Alias pour la compatibilité
    showSuccess: (message, title = "Succès") => showSuccess(message, title),
    showError: (message, title = "Erreur") => showError(message, title),
    showWarning: (message, title = "Avertissement") =>
      showWarning(message, title),
    showInfo: (message, title = "Information") => showInfo(message, title),
  };
};
