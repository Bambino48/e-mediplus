// src/components/NotificationCenter.jsx
import { useUIStore } from "../store/uiStore.js";

export default function NotificationCenter() {
    const { notifications, markAsRead, clearNotifications } = useUIStore();

    return (
        <div className="card">
            <div className="mb-2 flex items-center justify-between">
                <div className="font-medium">Notifications</div>
                <button className="btn-ghost text-xs" onClick={clearNotifications}>
                    Tout effacer
                </button>
            </div>

            {!notifications.length ? (
                <div className="text-sm text-slate-500">Aucune notification.</div>
            ) : (
                <ul className="space-y-2">
                    {notifications.map((n) => (
                        <li
                            key={n.id}
                            className={`rounded-xl border p-3 ${n.read ? "border-slate-200 dark:border-slate-800" : "border-cyan-300 dark:border-cyan-700"}`}
                        >
                            <div className="text-sm font-medium flex items-center justify-between">
                                <span>{n.title || "Notification"}</span>
                                {!n.read && (
                                    <button className="btn-ghost text-xs" onClick={() => markAsRead(n.id)}>
                                        Marquer lu
                                    </button>
                                )}
                            </div>
                            {n.message && <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">{n.message}</div>}
                            <div className="text-xs text-slate-400 mt-1">{new Date(n.ts).toLocaleString()}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
