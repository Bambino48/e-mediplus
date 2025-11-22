// src/pages/notifications/Notifications.jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    AlertCircle,
    Bell,
    Calendar,
    Check,
    Clock,
    CreditCard,
    Pill,
} from "lucide-react";
import {
    getAllNotifications,
    markNotificationAsRead,
} from "../../api/notifications.js";
import { useAppToast } from "../../hooks/useAppToast";
import PatientLayout from "../../layouts/PatientLayout.jsx";

export default function Notifications() {
    const queryClient = useQueryClient();
    const toast = useAppToast();

    // Récupérer toutes les notifications
    const { data, isLoading, error } = useQuery({
        queryKey: ["allNotifications"],
        queryFn: getAllNotifications,
        enabled: true,
    });

    // Mutation pour marquer une notification comme lue
    const markAsReadMutation = useMutation({
        mutationFn: markNotificationAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries(["allNotifications"]);
            queryClient.invalidateQueries(["unreadNotifications"]);
            toast.success("Notification marquée comme lue");
        },
        onError: () => {
            toast.error("Erreur lors de la mise à jour");
        },
    });

    // Fonction pour obtenir l'icône selon le type de notification
    const getNotificationIcon = (type) => {
        switch (type) {
            case "appointment_confirmed":
                return <Calendar className="h-5 w-5 text-green-600" />;
            case "appointment_cancelled":
                return <AlertCircle className="h-5 w-5 text-red-600" />;
            case "appointment_reminder":
                return <Clock className="h-5 w-5 text-blue-600" />;
            case "prescription_ready":
                return <Pill className="h-5 w-5 text-purple-600" />;
            case "payment_success":
                return <CreditCard className="h-5 w-5 text-green-600" />;
            case "payment_failed":
                return <CreditCard className="h-5 w-5 text-red-600" />;
            default:
                return <Bell className="h-5 w-5 text-gray-600" />;
        }
    };

    // Fonction pour obtenir la couleur selon le type
    const getNotificationColor = (type) => {
        switch (type) {
            case "appointment_confirmed":
                return "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800";
            case "appointment_cancelled":
                return "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800";
            case "appointment_reminder":
                return "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800";
            case "prescription_ready":
                return "border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800";
            case "payment_success":
                return "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800";
            case "payment_failed":
                return "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800";
            default:
                return "border-slate-200 bg-slate-50 dark:bg-slate-900/20 dark:border-slate-800";
        }
    };

    const notifications = data?.items || [];

    return (
        <PatientLayout title="Mes notifications">
            <div className="max-w-4xl mx-auto">
                <div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                Mes notifications
                            </h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Restez informé de vos rendez-vous et prescriptions
                            </p>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="card grid place-items-center py-16">
                        <div className="flex items-center gap-2">
                            <div className="animate-spin h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent"></div>
                            <span>Chargement des notifications...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="card border-red-200 bg-red-50 dark:bg-red-900/20">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertCircle className="h-5 w-5" />
                            <span>Erreur lors du chargement des notifications</span>
                        </div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="card grid place-items-center py-16">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Bell className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                            Aucune notification
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                            Vous n'avez pas encore reçu de notifications.
                            <br />
                            Elles apparaîtront ici automatiquement.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`card border-l-4 ${getNotificationColor(
                                    notification.type
                                )}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 mt-1">
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                    {notification.data?.title || "Notification"}
                                                </h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                                    {notification.data?.message || notification.type}
                                                </p>

                                                {notification.data?.scheduled_at && (
                                                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(
                                                            notification.data.scheduled_at
                                                        ).toLocaleString("fr-FR")}
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(notification.created_at).toLocaleString(
                                                        "fr-FR"
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 ml-4">
                                                {!notification.read_at && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                        Non lue
                                                    </span>
                                                )}

                                                {!notification.read_at && (
                                                    <button
                                                        onClick={() =>
                                                            markAsReadMutation.mutate(notification.id)
                                                        }
                                                        disabled={markAsReadMutation.isPending}
                                                        className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        {markAsReadMutation.isPending ? (
                                                            <div className="animate-spin h-3 w-3 rounded-full border border-green-600 border-t-transparent"></div>
                                                        ) : (
                                                            <Check className="h-3 w-3" />
                                                        )}
                                                        Marquer lu
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PatientLayout>
    );
}


