// src/pages/admin/Monetization.jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../hooks/useToast.js";

async function getMonetizationData() {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/monetization`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json',
        },
    });
    if (!response.ok) throw new Error('Erreur lors du chargement des données de monétisation');
    return response.json();
}

async function updatePlanPrice(planId, price) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/monetization/${planId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ price }),
    });
    if (!response.ok) throw new Error('Erreur lors de la mise à jour du prix');
    return response.json();
}

export default function Monetization() {
    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-monetization'],
        queryFn: getMonetizationData,
    });

    const mutation = useMutation({
        mutationFn: ({ planId, price }) => updatePlanPrice(planId, price),
        onSuccess: () => {
            showSuccess('Prix mis à jour avec succès');
            queryClient.invalidateQueries(['admin-monetization']);
        },
        onError: (err) => {
            showError(err.message || 'Erreur lors de la mise à jour');
        },
    });

    const handlePriceUpdate = (planId, newPrice) => {
        mutation.mutate({ planId, price: parseInt(newPrice) });
    };

    if (isLoading) return <div className="card grid place-items-center py-16">Chargement…</div>;
    if (error) return <div className="card text-red-600 p-4">Erreur: {error.message}</div>;

    const plans = data?.plans || [];

    return (
        <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
            <h1 className="text-xl font-semibold">Monétisation & abonnements</h1>

            <div className="grid sm:grid-cols-3 gap-3">
                {plans.map((plan) => (
                    <div key={plan.id} className="card text-center space-y-3">
                        <div className="text-lg font-medium">{plan.name}</div>
                        <div className="text-sm text-slate-500">{plan.description}</div>
                        <div className="text-sm text-green-600">{plan.active_users} utilisateurs actifs</div>
                        <input
                            type="number"
                            className="input w-24 mx-auto text-center"
                            defaultValue={plan.price}
                            onBlur={(e) => handlePriceUpdate(plan.id, e.target.value)}
                            disabled={mutation.isLoading}
                        />
                        <div className="text-slate-500 text-xs">FCFA / mois</div>
                    </div>
                ))}
            </div>

            <div className="card">
                <h2 className="text-lg font-medium mb-4">Revenus totaux</h2>
                <div className="text-2xl font-bold text-green-600">
                    {data?.total_revenue?.toLocaleString() || 0} FCFA
                </div>
            </div>
        </main>
    );
}
