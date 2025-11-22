// src/pages/static/About.jsx
export default function About() {
    return (
        <main className="max-w-3xl mx-auto px-4 py-10 space-y-4">
            <h1 className="text-2xl font-semibold">À propos de MediPlus</h1>
            <p className="text-slate-600 dark:text-slate-300">
                MediPlus est une plateforme e-santé intelligente qui simplifie le parcours de soin : trouver un praticien,
                réserver, téléconsulter, recevoir une ordonnance numérique, et suivre ses traitements.
            </p>
            <div className="card">
                <div className="font-medium mb-2">Notre vision</div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    Réduire le temps administratif, offrir une expérience patient claire et fluide, et donner aux professionnels
                    des outils modernes pour gérer leur activité.
                </p>
            </div>
        </main>
    );
}
