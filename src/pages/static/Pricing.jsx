// src/pages/static/Pricing.jsx
export default function Pricing() {
    const plans = [
        { name: "Basic", price: 0, features: ["Recherche & prise de RDV", "Dossier patient minimal"] },
        { name: "Pro", price: 5000, features: ["Téléconsultation", "Support prioritaire", "Mise en avant locale"] },
        { name: "Premium", price: 10000, features: ["Téléconsultation illimitée", "E-prescription", "Analytics avancés"] },
    ];

    return (
        <main className="max-w-6xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-semibold mb-6">Tarifs & Abonnements</h1>
            <div className="grid md:grid-cols-3 gap-4">
                {plans.map((p) => (
                    <div key={p.name} className="card text-center">
                        <div className="text-lg font-medium">{p.name}</div>
                        <div className="text-3xl font-bold my-2">{p.price.toLocaleString()} <span className="text-sm font-normal">FCFA/mois</span></div>
                        <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                            {p.features.map((f) => <li key={f}>• {f}</li>)}
                        </ul>
                        <button className="btn-primary mt-4">Choisir</button>
                    </div>
                ))}
            </div>
        </main>
    );
}
