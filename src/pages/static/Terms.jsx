export default function Terms() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Conditions Générales d'Utilisation</h1>

            <div className="prose prose-lg max-w-none">
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptation des Conditions</h2>
                    <p className="text-gray-600 mb-4">
                        En accédant et en utilisant MediPlus, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation.
                        Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Description du Service</h2>
                    <p className="text-gray-600 mb-4">
                        MediPlus est une plateforme e-Santé qui permet aux patients de prendre rendez-vous avec des professionnels de santé,
                        d'accéder à des consultations médicales à distance, et de gérer leurs prescriptions médicales.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Responsabilités des Utilisateurs</h2>
                    <p className="text-gray-600 mb-4">
                        Les utilisateurs s'engagent à fournir des informations exactes et à jour. Ils sont responsables
                        de la confidentialité de leurs identifiants de connexion.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Protection des Données</h2>
                    <p className="text-gray-600 mb-4">
                        MediPlus s'engage à protéger les données personnelles des utilisateurs conformément au RGPD
                        et aux réglementations en vigueur en Côte d'Ivoire.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Propriété Intellectuelle</h2>
                    <p className="text-gray-600 mb-4">
                        Tout le contenu de la plateforme MediPlus est protégé par des droits d'auteur.
                        L'utilisation du service n'entraîne pas de transfert de propriété intellectuelle.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Limitation de Responsabilité</h2>
                    <p className="text-gray-600 mb-4">
                        MediPlus ne peut être tenu responsable des interruptions de service, des pertes de données,
                        ou des dommages indirects liés à l'utilisation de la plateforme.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Modification des Conditions</h2>
                    <p className="text-gray-600 mb-4">
                        MediPlus se réserve le droit de modifier ces conditions à tout moment.
                        Les utilisateurs seront informés des changements majeurs.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Droit Applicable</h2>
                    <p className="text-gray-600 mb-4">
                        Ces conditions sont régies par le droit ivoirien. Tout litige sera soumis aux tribunaux compétents d'Abidjan.
                    </p>
                </section>

                <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">
                        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Pour toute question concernant ces conditions, contactez-nous à : legal@mediplus.ci
                    </p>
                </div>
            </div>
        </main>
    );
}