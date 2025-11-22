// src/api/notifications.js
import api from "./axiosInstance.js";

// ✅ API Réelles - Notifications non lues
export async function getUnreadNotifications() {
    const { data } = await api.get("/notifications/unread");
    return data; // { items: [...], count: 0 }
}

// ✅ API Réelles - Marquer une notification comme lue
export async function markNotificationAsRead(notificationId) {
    const { data } = await api.patch(`/notifications/${notificationId}/read`);
    return data;
}

// ✅ API Réelles - Liste de toutes les notifications
export async function getAllNotifications() {
    const { data } = await api.get("/notifications");
    return data; // { items: [...] }
}
