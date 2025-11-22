export default function Security() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Sécurité & Conformité</h1>

            <div className="prose prose-lg max-w-none">
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">🔒 Sécurité des Données</h2>
                    <p className="text-gray-600 mb-4">
                        Chez MediPlus, la sécurité de vos données médicales est notre priorité absolue.
                        Nous mettons en œuvre les plus hauts standards de sécurité pour protéger votre vie privée.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                        <li>Chiffrement end-to-end des données médicales</li>
                        <li>Authentification multi-facteurs obligatoire</li>
                        <li>Contrôles d'accès stricts basés sur les rôles</li>
                        <li>Audits de sécurité réguliers</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">🏥 Conformité Réglementaire</h2>
                    <p className="text-gray-600 mb-4">
                        MediPlus est entièrement conforme aux réglementations en vigueur en Côte d'Ivoire
                        et aux standards internationaux de protection des données médicales.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-2">🇨🇮 Réglementation Ivoirienne</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Loi sur la protection des données</li>
                                <li>• Code de la santé publique</li>
                                <li>• Normes CNIL Côte d'Ivoire</li>
                                <li>• Agrément ministériel</li>
                            </ul>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-2">🌍 Standards Internationaux</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• RGPD (UE)</li>
                                <li>• HIPAA (US)</li>
                                <li>• ISO 27001</li>
                                <li>• HITECH Act</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">🛡️ Mesures de Sécurité</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">Infrastructure</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Serveurs sécurisés</li>
                                <li>• Sauvegarde automatique</li>
                                <li>• Redondance géographique</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-semibold text-green-800 mb-2">Accès</h4>
                            <ul className="text-sm text-green-700 space-y-1">
                                <li>• Authentification forte</li>
                                <li>• Contrôle d'accès</li>
                                <li>• Logs d'audit</li>
                            </ul>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg">
                            <h4 className="font-semibold text-purple-800 mb-2">Surveillance</h4>
                            <ul className="text-sm text-purple-700 space-y-1">
                                <li>• Monitoring 24/7</li>
                                <li>• Détection d'intrusion</li>
                                <li>• Réponse aux incidents</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">📋 Certifications & Audits</h2>
                    <p className="text-gray-600 mb-4">
                        Notre plateforme fait l'objet d'audits réguliers par des organismes indépendants
                        pour garantir le maintien des standards de sécurité les plus élevés.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">ISO 27001</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">SOC 2 Type II</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">HIPAA Compliant</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">RGPD Compliant</span>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">🚨 Signalement de Vulnérabilités</h2>
                    <p className="text-gray-600 mb-4">
                        Si vous découvrez une vulnérabilité de sécurité, nous vous encourageons à nous la signaler
                        de manière responsable. Nous avons mis en place un programme de bug bounty.
                    </p>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800">
                            <strong>Contact sécurité :</strong> security@mediplus.ci
                        </p>
                        <p className="text-yellow-700 text-sm mt-1">
                            Nous nous engageons à répondre sous 24h et à récompenser les signalements validés.
                        </p>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">📞 Support & Assistance</h2>
                    <p className="text-gray-600 mb-4">
                        Notre équipe de sécurité est disponible pour répondre à vos questions
                        concernant la protection de vos données médicales.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-2">Support Technique</h4>
                            <p className="text-gray-600 text-sm">support@mediplus.ci</p>
                            <p className="text-gray-600 text-sm">+225 01 02 03 04 05</p>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-2">Questions RGPD</h4>
                            <p className="text-gray-600 text-sm">privacy@mediplus.ci</p>
                            <p className="text-gray-600 text-sm">Du lundi au vendredi, 8h-18h</p>
                        </div>
                    </div>
                </section>

                <div className="mt-12 p-6 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-cyan-800 mb-2">🛡️ Votre Sécurité, Notre Engagement</h3>
                    <p className="text-cyan-700">
                        MediPlus s'engage à maintenir les plus hauts standards de sécurité pour protéger
                        vos données médicales et votre vie privée. La confiance de nos utilisateurs est notre bien le plus précieux.
                    </p>
                    <p className="text-cyan-600 text-sm mt-2">
                        Dernière mise à jour de la politique de sécurité : {new Date().toLocaleDateString('fr-FR')}
                    </p>
                </div>
            </div>
        </main>
    );
}