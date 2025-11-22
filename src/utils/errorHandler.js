// src/utils/errorHandler.js

/**
 * Utilitaire pour gérer les erreurs API de manière centralisée
 */

/**
 * Extrait un message d'erreur lisible depuis une erreur API
 * @param {Error} error - L'erreur à analyser
 * @returns {string} Message d'erreur formaté
 */
export function getErrorMessage(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.message) {
    return error.message;
  }

  return "Une erreur inattendue s'est produite";
}

/**
 * Détermine si l'erreur est une erreur temporaire du serveur
 * @param {Error} error - L'erreur à analyser
 * @returns {boolean} True si c'est une erreur temporaire
 */
export function isTemporaryError(error) {
  const status = error?.response?.status;
  return status >= 500 && status < 600;
}

/**
 * Détermine si l'erreur est liée à l'authentification
 * @param {Error} error - L'erreur à analyser
 * @returns {boolean} True si c'est une erreur d'authentification
 */
export function isAuthError(error) {
  const status = error?.response?.status;
  return status === 401 || status === 403;
}

/**
 * Log une erreur avec contexte
 * @param {string} context - Le contexte où l'erreur s'est produite
 * @param {Error} error - L'erreur à logger
 */
export function logError(context, error) {
  console.error(`[${context}] Erreur:`, {
    message: getErrorMessage(error),
    status: error?.response?.status,
    data: error?.response?.data,
    stack: error?.stack,
  });
}
