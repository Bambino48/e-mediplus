/* eslint-disable no-unused-vars */
import { Store } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToastContext } from "../../context/ToastProvider.jsx";

export default function AddPharmacy() {
    const { showSuccess, showError } = useToastContext();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "Côte d'Ivoire",
        postal_code: "",
        latitude: "",
        longitude: "",
        license_number: "",
        manager_name: "",
        description: "",
        opening_hours: {
            monday: { open: "08:00", close: "18:00", closed: false },
            tuesday: { open: "08:00", close: "18:00", closed: false },
            wednesday: { open: "08:00", close: "18:00", closed: false },
            thursday: { open: "08:00", close: "18:00", closed: false },
            friday: { open: "08:00", close: "18:00", closed: false },
            saturday: { open: "08:00", close: "16:00", closed: false },
            sunday: { open: "00:00", close: "00:00", closed: true },
        },
        services: [],
        emergency_contact: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOpeningHoursChange = (day, field, value) => {
        setFormData(prev => ({
            ...prev,
            opening_hours: {
                ...prev.opening_hours,
                [day]: {
                    ...prev.opening_hours[day],
                    [field]: value
                }
            }
        }));
    };

    const handleServiceToggle = (service) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/pharmacies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création de la pharmacie');
            }

            const result = await response.json();
            showSuccess('Pharmacie ajoutée avec succès !');
            navigate('/admin/catalog');
        } catch (error) {
            console.error('Erreur:', error);
            showError(error.message || 'Erreur lors de l\'ajout de la pharmacie');
        } finally {
            setIsSubmitting(false);
        }
    };

    const services = [
        "Livraison à domicile",
        "Conseils pharmaceutiques",
        "Garde de nuit",
        "Vaccination",
        "Tests de dépistage",
        "Orthopédie",
        "Parapharmacie",
        "Préparation de médicaments"
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Store className="h-8 w-8 text-teal-600" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Ajouter une pharmacie
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Enregistrer une nouvelle pharmacie dans le catalogue
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Informations générales */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Informations générales</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Nom de la pharmacie *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="input w-full"
                                placeholder="Pharmacie du Bien-être"
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
                                placeholder="contact@pharmacie.ci"
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
                            <label className="block text-sm font-medium mb-2">Numéro de licence</label>
                            <input
                                type="text"
                                name="license_number"
                                value={formData.license_number}
                                onChange={handleInputChange}
                                className="input w-full"
                                placeholder="Numéro d'autorisation"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Nom du gérant</label>
                            <input
                                type="text"
                                name="manager_name"
                                value={formData.manager_name}
                                onChange={handleInputChange}
                                className="input w-full"
                                placeholder="Mme Marie Dupont"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Contact d'urgence</label>
                            <input
                                type="tel"
                                name="emergency_contact"
                                value={formData.emergency_contact}
                                onChange={handleInputChange}
                                className="input w-full"
                                placeholder="+225 XX XX XX XX XX"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="input w-full h-24 resize-none"
                            placeholder="Description de la pharmacie, services particuliers..."
                            maxLength="500"
                        />
                        <span className="text-sm text-gray-500">{formData.description.length}/500 caractères</span>
                    </div>
                </div>

                {/* Adresse */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Adresse</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Adresse *</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="input w-full"
                                placeholder="123 Boulevard de la Santé"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Ville *</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="input w-full"
                                placeholder="Abidjan"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Code postal</label>
                            <input
                                type="text"
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleInputChange}
                                className="input w-full"
                                placeholder="00225"
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

                    {/* Coordonnées GPS */}
                    <div className="mt-4">
                        <h3 className="text-md font-medium mb-3">Coordonnées GPS (optionnel)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Latitude</label>
                                <input
                                    type="text"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleInputChange}
                                    className="input w-full"
                                    placeholder="5.3167"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Longitude</label>
                                <input
                                    type="text"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleInputChange}
                                    className="input w-full"
                                    placeholder="-4.0333"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Horaires d'ouverture */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Horaires d'ouverture</h2>
                    <div className="space-y-3">
                        {Object.entries(formData.opening_hours).map(([day, hours]) => (
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
                                        checked={!hours.closed}
                                        onChange={(e) => handleOpeningHoursChange(day, 'closed', !e.target.checked)}
                                        className="rounded"
                                    />
                                    <span className="text-sm">Ouvert</span>
                                </label>

                                {!hours.closed && (
                                    <>
                                        <input
                                            type="time"
                                            value={hours.open}
                                            onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                                            className="input text-sm"
                                        />
                                        <span className="text-sm text-gray-500">à</span>
                                        <input
                                            type="time"
                                            value={hours.close}
                                            onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                                            className="input text-sm"
                                        />
                                    </>
                                )}

                                {hours.closed && (
                                    <span className="text-sm text-gray-500 italic">Fermé</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Services */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Services proposés</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {services.map((service) => (
                            <label key={service} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.services.includes(service)}
                                    onChange={() => handleServiceToggle(service)}
                                    className="rounded"
                                />
                                <span className="text-sm">{service}</span>
                            </label>
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
                        {isSubmitting ? 'Création en cours...' : 'Créer la pharmacie'}
                    </button>
                </div>
            </form>
        </div>
    );
}