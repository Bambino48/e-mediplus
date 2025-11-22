export default function RecommendationList({ items, type }) {
    if (!items?.length) return <div className="text-sm text-slate-500">Aucune recommandation pour le moment.</div>;

    return (
        <div className="grid sm:grid-cols-2 gap-3">
            {items.map((it) => (
                <div key={it.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                    <div className="font-medium">{it.name}</div>
                    {it.specialty && <div className="text-sm text-slate-500">{it.specialty}</div>}
                    {it.address && <div className="text-sm text-slate-500">{it.address}</div>}
                    {it.distance_km && (
                        <div className="text-xs text-slate-400">à {it.distance_km} km — ⭐ {it.rating}</div>
                    )}
                    {type === "pharmacy" && (
                        <div className={`text-xs mt-1 ${it.open ? "text-green-600" : "text-red-500"}`}>
                            {it.open ? "Ouverte" : "Fermée"}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
