/* eslint-disable no-unused-vars */
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToastContext } from "../../context/ToastProvider.jsx";

export default function AddDoctor() {
    const { showSuccess, showError } = useToastContext();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        specialty: "",
        license_number: "",
        address: "",
        city: "",
        country: "Côte d'Ivoire",
        bio: "",
        experience_years: "",
        consultation_fee: "",
        languages: ["Français"],
        availability: {
            monday: { enabled: true, start: "08:00", end: "17:00" },
            tuesday: { enabled: true, start: "08:00", end: "17:00" },
            wednesday: { enabled: true, start: "08:00", end: "17:00" },
            thursday: { enabled: true, start: "08:00", end: "17:00" },
            friday: { enabled: true, start: "08:00", end: "17:00" },
            saturday: { enabled: false, start: "08:00", end: "12:00" },
            sunday: { enabled: false, start: "08:00", end: "12:00" },
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvailabilityChange = (day, field, value) => {
        setFormData(prev => ({
            ...prev,
            availability: {
                ...prev.availability,
                [day]: {
                    ...prev.availability[day],
                    [field]: value
                }
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/doctors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création du médecin');
            }

            const result = await response.json();
            showSuccess('Médecin ajouté avec succès !');
            navigate('/admin/users');
        } catch (error) {
            console.error('Erreur:', error);
            showError(error.message || 'Erreur lors de l\'ajout du médecin');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <UserPlus className="h-8 w-8 text-cyan-600" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Ajouter un médecin
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Créer un nouveau compte médecin dans la plateforme
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Informations personnelles */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Informations personnelles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Nom complet *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="input w-full"
                                placeholder="Dr. Jean Dupont"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="input w-full"
                                placeholder="docteur@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Téléphone *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="input w-full"
                                placeholder="+225 XX XX XX XX XX"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Spécialité *</label>
                            <select
                                name="specialty"
                                value={formData.specialty}
                                onChange={handleInputChange}
                                className="input w-full"
                                required
                            >
                                <option value="">Sélectionner une spécialité</option>
                                <option value="Médecine générale">Médecine générale</option>
                                <option value="Cardiologie">Cardiologie</option>
                                <option value="Dermatologie">Dermatologie</option>
                                <option value="Gynécologie">Gynécologie</option>
                                <option value="Ophtalmologie">Ophtalmologie</option>
                                <option value="Pédiatrie">Pédiatrie</option>
                                <option value="Psychiatrie">Psychiatrie</option>
                                <option value="Radiologie">Radiologie</option>
                                <option value="Urologie">Urologie</option>
                                <option value="Autre">Autre</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Numéro de licence</label>
                            <input
                                type="text"
                                name="license_number"
                                value={formData.license_number}
                                onChange={handleInputChange}
                                className="input w-full"
                                placeholder="Numéro d'ordre des médecins"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Années d'expérience</label>
                            <input
                                type="number"
                                name="experience_years"
                                value={formData.experience_years}
                                onChange={handleInputChange}
                                className="input w-full"
                                placeholder="5"
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">Biographie</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            className="input w-full h-24 resize-none"
                            placeholder="Courte description du parcours professionnel..."
                            maxLength="500"
                        />
                        <span className="text-sm text-gray-500">{formData.bio.length}/500 caractères</span>
                    </div>
                </div>

                {/* Adresse */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Adresse professionnelle</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Adresse</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="input w-full"
                                placeholder="123 Avenue de la Santé"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Ville</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="input w-full"
                                placeholder="Abidjan"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Pays</label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                className="input w-full"
                                placeholder="Côte d'Ivoire"
                            />
                        </div>
                    </div>
                </div>

                {/* Tarification */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Tarification</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Frais de consultation (FCFA)</label>
                            <input
                                type="number"
                                name="consultation_fee"
                                value={formData.consultation_fee}
                                onChange={handleInputChange}
                                className="input w-full"
                                placeholder="25000"
                                min="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Disponibilités */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Disponibilités</h2>
                    <div className="space-y-3">
                        {Object.entries(formData.availability).map(([day, config]) => (
                            <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                                <div className="w-24">
                                    <span className="font-medium capitalize">
                                        {day === 'monday' ? 'Lundi' :
                                            day === 'tuesday' ? 'Mardi' :
                                                day === 'wednesday' ? 'Mercredi' :
                                                    day === 'thursday' ? 'Jeudi' :
                                                        day === 'friday' ? 'Vendredi' :
                                                            day === 'saturday' ? 'Samedi' : 'Dimanche'}
                                    </span>
                                </div>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={config.enabled}
                                        onChange={(e) => handleAvailabilityChange(day, 'enabled', e.target.checked)}
                                        className="rounded"
                                    />
                                    <span className="text-sm">Disponible</span>
                                </label>

                                {config.enabled && (
                                    <>
                                        <input
                                            type="time"
                                            value={config.start}
                                            onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)}
                                            className="input text-sm"
                                        />
                                        <span className="text-sm text-gray-500">à</span>
                                        <input
                                            type="time"
                                            value={config.end}
                                            onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)}
                                            className="input text-sm"
                                        />
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/dashboard')}
                        className="btn-secondary"
                        disabled={isSubmitting}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Création en cours...' : 'Créer le médecin'}
                    </button>
                </div>
            </form>
        </div>
    );
}