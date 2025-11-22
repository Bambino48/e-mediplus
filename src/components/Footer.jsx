
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Veuillez saisir votre adresse email');
            return;
        }

        if (!validateEmail(email)) {
            setError('Veuillez saisir une adresse email valide');
            return;
        }

        setIsLoading(true);

        try {
            // Simulation d'appel API - À remplacer par un vrai appel
            await new Promise(resolve => setTimeout(resolve, 1000));

            setIsSubscribed(true);
            setEmail('');
        } catch (err) {
            setError('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <footer className="border-t border-slate-200 dark:border-slate-800 mt-auto">
            <div className="max-w-6xl mx-auto px-4 py-10 grid sm:grid-cols-2 md:grid-cols-5 gap-6 text-sm">
                <div className="md:col-span-2">
                    <div className="text-lg font-bold text-cyan-600">MediPlus</div>
                    <p className="text-slate-500 mt-2 leading-relaxed">
                        Plateforme e-Santé intelligente : RDV, téléconsultation,
                        prescriptions et plus. Votre santé, notre priorité.
                    </p>

                    {/* Newsletter */}
                    <div className="mt-6">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Restez informé</h4>
                        {isSubscribed ? (
                            <div className="flex items-center space-x-2 text-green-600 text-sm">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                                <span>Merci pour votre inscription !</span>
                            </div>
                        ) : (
                            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (error) setError('');
                                        }}
                                        placeholder="Votre email"
                                        className={`flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${error ? 'border-red-300' : 'border-slate-300'
                                            }`}
                                        required
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="px-4 py-2 bg-cyan-600 text-white text-sm rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                                    >
                                        {isLoading ? (
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <span>S'inscrire</span>
                                        )}
                                    </button>
                                </div>
                                {error && (
                                    <p className="text-red-600 text-xs flex items-center space-x-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                        </svg>
                                        <span>{error}</span>
                                    </p>
                                )}
                            </form>
                        )}
                    </div>

                    {/* Contact et réseaux sociaux */}
                    <div className="mt-6">
                        <div className="flex items-center space-x-4 mb-4">
                            <a href="tel:+2250102030405" className="text-slate-400 hover:text-cyan-600 transition-colors flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                                </svg>
                                <span>+225 01 02 03 04 05</span>
                            </a>
                        </div>

                        <div className="flex space-x-4">
                            <a
                                href="#"
                                className="text-slate-400 hover:text-blue-600 transition-colors opacity-50 cursor-not-allowed"
                                aria-label="Facebook - Bientôt disponible"
                                title="Facebook - Bientôt disponible"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="text-slate-400 hover:text-blue-400 transition-colors opacity-50 cursor-not-allowed"
                                aria-label="Twitter - Bientôt disponible"
                                title="Twitter - Bientôt disponible"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="text-slate-400 hover:text-blue-700 transition-colors opacity-50 cursor-not-allowed"
                                aria-label="LinkedIn - Bientôt disponible"
                                title="LinkedIn - Bientôt disponible"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="text-slate-400 hover:text-pink-600 transition-colors opacity-50 cursor-not-allowed"
                                aria-label="Instagram - Bientôt disponible"
                                title="Instagram - Bientôt disponible"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.017 0C8.396 0 7.996.014 6.79.067 5.59.12 4.694.287 3.94.547c-.795.275-1.467.647-2.14 1.32S.822 3.205.547 4c-.26.754-.427 1.65-.48 2.85C.014 8.056 0 8.456 0 12.077s.014 4.021.067 5.227c.053 1.2.22 2.096.48 2.85.275.795.647 1.467 1.32 2.14s1.445.945 2.14 1.32c.754.26 1.65.427 2.85.48C7.996 23.986 8.396 24 12.017 24s4.021-.014 5.227-.067c1.2-.053 2.096-.22 2.85-.48.795-.275 1.467-.647 2.14-1.32s.945-1.445 1.32-2.14c.26-.754.427-1.65.48-2.85.067-1.206.067-1.606.067-5.227s-.014-4.021-.067-5.227c-.053-1.2-.22-2.096-.48-2.85-.275-.795-.647-1.467-1.32-2.14S20.812.822 20.037.547c-.754-.26-1.65-.427-2.85-.48C16.038.014 15.638 0 12.017 0zm0 2.182c3.532 0 3.955.013 5.354.073 1.286.054 1.974.23 2.426.383.597.202.99.442 1.426.878.434.436.676.829.878 1.426.153.452.329 1.14.383 2.426.06 1.399.073 1.822.073 5.354s-.013 3.955-.073 5.354c-.054 1.286-.23 1.974-.383 2.426-.202.597-.442.99-.878 1.426-.436.434-.829.676-1.426.878-.452.153-1.14.329-2.426.383-1.399.06-1.822.073-5.354.073s-3.955-.013-5.354-.073c-1.286-.054-1.974-.23-2.426-.383-.597-.202-.99-.442-1.426-.878-.434-.436-.676-.829-.878-1.426-.153-.452-.329-1.14-.383-2.426C2.24 8.429 2.067 7.741 2.182 6.455c.06-1.399.073-1.822.073-5.354s-.013-3.955-.073-5.354c-.054-1.286-.23-1.974-.383-2.426-.202-.597-.442-.99-.878-1.426C3.358 2.624 2.965 2.382 2.368 2.18 1.916 2.027 1.228 1.851.942 1.797.543 1.737.12 1.724 0 1.724v.001c3.532 0 3.955.013 5.354.073 1.286.054 1.974.23 2.426.383.597.202.99.442 1.426.878.434.436.676.829.878 1.426.153.452.329 1.14.383 2.426.06 1.399.073 1.822.073 5.354zM12.017 6.182a5.895 5.895 0 100 11.79 5.895 5.895 0 000-11.79zm0 9.719a3.824 3.824 0 110-7.648 3.824 3.824 0 010 7.648zM20.094 6.182a1.382 1.382 0 11-2.764 0 1.382 1.382 0 012.764 0z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Liens rapides</h3>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                        <li><Link to="/search" className="hover:underline transition-colors" aria-label="Rechercher un médecin">Rechercher un médecin</Link></li>
                        <li><Link to="/triage" className="hover:underline transition-colors" aria-label="Utiliser le triage IA">Triage IA</Link></li>
                        <li><Link to="/pricing" className="hover:underline transition-colors" aria-label="Consulter les tarifs">Tarifs</Link></li>
                        <li><Link to="/contact" className="hover:underline transition-colors" aria-label="Nous contacter">Contact</Link></li>
                        <li><Link to="/about" className="hover:underline transition-colors" aria-label="En savoir plus sur nous">À propos</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Professionnels</h3>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                        <li><Link to="/pro/dashboard" className="hover:underline transition-colors" aria-label="Accéder au tableau de bord professionnel">Tableau de bord</Link></li>
                        <li><Link to="/pro/calendar" className="hover:underline transition-colors" aria-label="Gérer le calendrier des rendez-vous">Calendrier</Link></li>
                        <li><Link to="/pro/patients" className="hover:underline transition-colors" aria-label="Gérer la liste des patients">Mes patients</Link></li>
                        <li><Link to="/pro/prescriptions" className="hover:underline transition-colors" aria-label="Gérer les prescriptions">Prescriptions</Link></li>
                        <li><Link to="/pro/billing" className="hover:underline transition-colors" aria-label="Consulter les revenus">Revenus</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Légal</h3>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                        <li><Link to="/terms" className="hover:underline transition-colors" aria-label="Lire les conditions générales d'utilisation">CGU</Link></li>
                        <li><Link to="/security" className="hover:underline transition-colors" aria-label="Consulter la politique de sécurité">Sécurité</Link></li>
                        <li><a href="/privacy" className="hover:underline transition-colors" aria-label="Lire la politique de confidentialité">Confidentialité</a></li>
                        <li><a href="/cookies" className="hover:underline transition-colors" aria-label="Gérer les cookies">Cookies</a></li>
                    </ul>
                </div>
            </div>

            <div className="py-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700">
                <div className="flex justify-center items-center space-x-8 mb-3">
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm3 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                        </svg>
                        <span>Données sécurisées</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H7v-4h4v4zm0-6H7V7h4v4zm6 6h-4v-4h4v4zm0-6h-4V7h4v4z" />
                        </svg>
                        <span>Agréé médical</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span>Conforme RGPD</span>
                    </div>
                </div>
                <p className="text-slate-400">© {new Date().getFullYear()} MediPlus — Tous droits réservés.</p>
            </div>
        </footer>
    );
}
