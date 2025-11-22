// src/pages/admin/Reports.jsx
import { useQuery } from "@tanstack/react-query";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

async function fetchStats() {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/reports`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json',
        },
    });
    if (!response.ok) throw new Error('Erreur lors du chargement des statistiques');
    const data = await response.json();

    // Utiliser les vraies données du backend pour l'activité mensuelle
    const activity = data.monthly_activity || [
        { month: "Jan", consultations: 0, revenue: 0 },
        { month: "Fév", consultations: 0, revenue: 0 },
        { month: "Mar", consultations: 0, revenue: 0 },
        { month: "Avr", consultations: 0, revenue: 0 },
        { month: "Mai", consultations: 0, revenue: 0 },
        { month: "Juin", consultations: 0, revenue: 0 },
    ];

    return {
        users: data.total_users || 0,
        doctors: data.total_doctors || 0,
        consultations: data.total_consultations || 0,
        revenue: data.total_revenue || 0,
        consultationsThisMonth: data.consultations_this_month || 0,
        revenueThisMonth: data.revenue_this_month || 0,
        pharmacies: data.total_pharmacies || 0,
        incompleteProfiles: data.incomplete_profiles || 0,
        pendingItems: data.pending_items || 0,
        recentReports: data.recent_reports || 0,
        activity: activity,
    };
}

export default function Reports() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["admin-stats"],
        queryFn: fetchStats,
    });

    if (isLoading) return <div className="card grid place-items-center py-16">Chargement…</div>;
    if (error) return <div className="card text-red-600 p-4">Erreur: {error.message}</div>;

    return (
        <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
            <h1 className="text-xl font-semibold">Rapports et statistiques</h1>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="card text-center">
                    <div className="text-2xl font-semibold">{data.users}</div>
                    <div className="text-sm text-slate-500">Utilisateurs</div>
                </div>
                <div className="card text-center">
                    <div className="text-2xl font-semibold">{data.doctors}</div>
                    <div className="text-sm text-slate-500">Médecins</div>
                </div>
                <div className="card text-center">
                    <div className="text-2xl font-semibold">{data.consultations}</div>
                    <div className="text-sm text-slate-500">Consultations</div>
                </div>
                <div className="card text-center">
                    <div className="text-2xl font-semibold">{data.revenue.toLocaleString()} FCFA</div>
                    <div className="text-sm text-slate-500">Revenus</div>
                </div>
                <div className="card text-center">
                    <div className="text-2xl font-semibold">{data.pharmacies}</div>
                    <div className="text-sm text-slate-500">Pharmacies</div>
                </div>
                <div className="card text-center">
                    <div className="text-2xl font-semibold">{data.consultationsThisMonth}</div>
                    <div className="text-sm text-slate-500">Consultations ce mois</div>
                </div>
                <div className="card text-center">
                    <div className="text-2xl font-semibold">{data.revenueThisMonth.toLocaleString()} FCFA</div>
                    <div className="text-sm text-slate-500">Revenus ce mois</div>
                </div>
                <div className="card text-center">
                    <div className="text-2xl font-semibold">{data.pendingItems}</div>
                    <div className="text-sm text-slate-500">Éléments en attente</div>
                </div>
            </div>

            <div className="card">
                <h2 className="text-lg font-medium mb-4">Évolution des consultations et revenus</h2>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height={256}>
                        <LineChart data={data.activity}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value, name) => [
                                name === 'revenue' ? `${value.toLocaleString()} FCFA` : value,
                                name === 'revenue' ? 'Revenus' : 'Consultations'
                            ]} />
                            <Line
                                type="monotone"
                                dataKey="consultations"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                name="consultations"
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#10b981"
                                strokeWidth={2}
                                name="revenue"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </main>
    );
}
