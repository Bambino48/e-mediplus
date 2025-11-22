/* eslint-disable no-unused-vars */
// src/pages/admin/Settings.jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { useToast } from "../../hooks/useToast.js";

async function getSettings() {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json',
        },
    });
    if (!response.ok) throw new Error('Erreur lors du chargement des paramètres');
    return response.json();
}

async function updateSettings(settings) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error('Erreur lors de la sauvegarde des paramètres');
    return response.json();
}

async function getProfile() {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/profile`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json',
        },
    });
    if (!response.ok) throw new Error('Erreur lors du chargement du profil');
    return response.json();
}

export default function AdminSettings() {
    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-settings'],
        queryFn: getSettings,
    });

    const { data: profileData, isLoading: profileLoading, error: profileError } = useQuery({
        queryKey: ['admin-profile'],
        queryFn: getProfile,
    });

    const mutation = useMutation({
        mutationFn: updateSettings,
        onSuccess: () => {
            showSuccess('Paramètres sauvegardés avec succès');
            queryClient.invalidateQueries(['admin-settings']);
        },
        onError: (err) => {
            showError(err.message || 'Erreur lors de la sauvegarde');
        },
    });

    const [localSettings, setLocalSettings] = useState({});
    const [localProfile, setLocalProfile] = useState({});
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Synchroniser les données chargées avec l'état local
    React.useEffect(() => {
        if (data?.settings) {
            setLocalSettings(data.settings);
        }
    }, [data]);

    React.useEffect(() => {
        if (profileData?.profile) {
            setLocalProfile(profileData.profile);
        }
    }, [profileData]);

    const handleUpdate = (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleProfileUpdate = (key, value) => {
        setLocalProfile(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        mutation.mutate(localSettings);
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validation du type de fichier
            if (!file.type.startsWith('image/')) {
                showError('Veuillez sélectionner un fichier image valide.');
                return;
            }

            // Validation de la taille (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showError('La taille de l\'image ne doit pas dépasser 2MB.');
                return;
            }

            setSelectedPhoto(file);

            // Créer un aperçu
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setSelectedPhoto(null);
        setPhotoPreview(null);
        handleProfileUpdate('photo', null);
    };

    const handleSaveProfile = async () => {
        setIsUpdatingProfile(true);
        try {
            const formData = new FormData();

            // Ajouter les données du profil
            Object.keys(localProfile).forEach(key => {
                if (key !== 'photo' && localProfile[key] !== null && localProfile[key] !== undefined) {
                    if (key === 'notifications') {
                        formData.append(key, JSON.stringify(localProfile[key]));
                    } else {
                        formData.append(key, localProfile[key]);
                    }
                }
            });

            // Ajouter la photo si elle existe
            if (selectedPhoto) {
                formData.append('photo', selectedPhoto);
            } else if (localProfile.photo === null) {
                // Supprimer la photo
                formData.append('photo', '');
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    // Ne pas définir Content-Type pour FormData
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la mise à jour du profil');
            }

            const data = await response.json();
            showSuccess('Profil mis à jour avec succès');
            queryClient.invalidateQueries(['admin-profile']);

            // Réinitialiser l'état local
            setSelectedPhoto(null);
            setPhotoPreview(null);

        } catch (err) {
            showError(err.message || 'Erreur lors de la mise à jour du profil');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    if (isLoading || profileLoading) return <div className="card grid place-items-center py-16">Chargement…</div>;
    if (error || profileError) return <div className="card text-red-600 p-4">Erreur: {error?.message || profileError?.message}</div>;

    const settings = localSettings;
    const profile = localProfile;

    return (
        <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <h1 className="text-xl font-semibold">Paramètres de la plateforme</h1>

            {/* Section Profil Administrateur */}
            <div className="card space-y-6">
                <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Profil Administrateur</h2>

                {/* Informations de base */}
                <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-700">Informations de base</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block space-y-2">
                            <span className="font-medium">Nom complet</span>
                            <input
                                type="text"
                                className="input w-full"
                                value={profile.name || ''}
                                onChange={(e) => handleProfileUpdate("name", e.target.value)}
                                disabled={isUpdatingProfile}
                                placeholder="Votre nom complet"
                            />
                        </label>

                        <label className="block space-y-2">
                            <span className="font-medium">Adresse email</span>
                            <input
                                type="email"
                                className="input w-full"
                                value={profile.email || ''}
                                onChange={(e) => handleProfileUpdate("email", e.target.value)}
                                disabled={isUpdatingProfile}
                                placeholder="votre.email@exemple.com"
                            />
                        </label>

                        <label className="block space-y-2">
                            <span className="font-medium">Téléphone</span>
                            <input
                                type="tel"
                                className="input w-full"
                                value={profile.phone || ''}
                                onChange={(e) => handleProfileUpdate("phone", e.target.value)}
                                disabled={isUpdatingProfile}
                                placeholder="+225 XX XX XX XX XX"
                            />
                        </label>

                        <label className="block space-y-2">
                            <span className="font-medium">Localisation</span>
                            <input
                                type="text"
                                className="input w-full"
                                value={profile.location || ''}
                                onChange={(e) => handleProfileUpdate("location", e.target.value)}
                                disabled={isUpdatingProfile}
                                placeholder="Ville, Pays"
                            />
                        </label>
                    </div>

                    {/* Photo de profil */}
                    <div className="col-span-full">
                        <label className="block space-y-2">
                            <span className="font-medium">Photo de profil</span>
                            <div className="flex items-center space-x-4">
                                {/* Aperçu de la photo */}
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full border-2 border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center">
                                        {photoPreview || profile.photo_url ? (
                                            <img
                                                src={photoPreview || profile.photo_url}
                                                alt="Aperçu"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-gray-400 text-2xl">
                                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    {(photoPreview || profile.photo_url) && (
                                        <button
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                            title="Supprimer la photo"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>

                                {/* Sélecteur de fichier */}
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                        id="photo-upload"
                                        disabled={isUpdatingProfile}
                                    />
                                    <label
                                        htmlFor="photo-upload"
                                        className="btn-secondary cursor-pointer inline-block"
                                    >
                                        {selectedPhoto ? 'Changer la photo' : 'Sélectionner une photo'}
                                    </label>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Formats acceptés: JPG, PNG, GIF. Taille max: 2MB
                                    </p>
                                    {selectedPhoto && (
                                        <p className="text-sm text-green-600 mt-1">
                                            Photo sélectionnée: {selectedPhoto.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Préférences */}
                <div className="space-y-4 border-t pt-4">
                    <h3 className="text-md font-medium text-gray-700">Préférences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block space-y-2">
                            <span className="font-medium">Fuseau horaire</span>
                            <select
                                className="input w-full"
                                value={profile.timezone || 'Africa/Abidjan'}
                                onChange={(e) => handleProfileUpdate("timezone", e.target.value)}
                                disabled={isUpdatingProfile}
                            >
                                <option value="Africa/Abidjan">Afrique/Abidjan (UTC+0)</option>
                                <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                                <option value="America/New_York">Amérique/New_York (UTC-5)</option>
                                <option value="Asia/Dubai">Asie/Dubaï (UTC+4)</option>
                            </select>
                        </label>

                        <label className="block space-y-2">
                            <span className="font-medium">Langue</span>
                            <select
                                className="input w-full"
                                value={profile.language || 'fr'}
                                onChange={(e) => handleProfileUpdate("language", e.target.value)}
                                disabled={isUpdatingProfile}
                            >
                                <option value="fr">Français</option>
                                <option value="en">English</option>
                            </select>
                        </label>
                    </div>
                </div>

                {/* Biographie */}
                <div className="space-y-4 border-t pt-4">
                    <h3 className="text-md font-medium text-gray-700">Biographie</h3>
                    <label className="block space-y-2">
                        <span className="font-medium">Description personnelle</span>
                        <textarea
                            className="input w-full h-24 resize-none"
                            value={profile.bio || ''}
                            onChange={(e) => handleProfileUpdate("bio", e.target.value)}
                            disabled={isUpdatingProfile}
                            placeholder="Décrivez brièvement votre rôle et vos responsabilités..."
                            maxLength="500"
                        />
                        <span className="text-sm text-gray-500">{(profile.bio || '').length}/500 caractères</span>
                    </label>
                </div>

                {/* Préférences de notifications */}
                <div className="space-y-4 border-t pt-4">
                    <h3 className="text-md font-medium text-gray-700">Notifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center justify-between">
                            <span>Notifications par email</span>
                            <input
                                type="checkbox"
                                checked={profile.notifications?.email ?? true}
                                onChange={(e) => handleProfileUpdate("notifications", {
                                    ...profile.notifications,
                                    email: e.target.checked
                                })}
                                disabled={isUpdatingProfile}
                            />
                        </label>

                        <label className="flex items-center justify-between">
                            <span>Rapports et alertes</span>
                            <input
                                type="checkbox"
                                checked={profile.notifications?.reports ?? true}
                                onChange={(e) => handleProfileUpdate("notifications", {
                                    ...profile.notifications,
                                    reports: e.target.checked
                                })}
                                disabled={isUpdatingProfile}
                            />
                        </label>

                        <label className="flex items-center justify-between">
                            <span>Alertes système</span>
                            <input
                                type="checkbox"
                                checked={profile.notifications?.system_alerts ?? true}
                                onChange={(e) => handleProfileUpdate("notifications", {
                                    ...profile.notifications,
                                    system_alerts: e.target.checked
                                })}
                                disabled={isUpdatingProfile}
                            />
                        </label>

                        <label className="flex items-center justify-between">
                            <span>Nouvelles inscriptions</span>
                            <input
                                type="checkbox"
                                checked={profile.notifications?.user_registrations ?? false}
                                onChange={(e) => handleProfileUpdate("notifications", {
                                    ...profile.notifications,
                                    user_registrations: e.target.checked
                                })}
                                disabled={isUpdatingProfile}
                            />
                        </label>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">
                        <p>Rôle: <span className="font-medium capitalize">{profile.role}</span></p>
                        <p>Dernière mise à jour: {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('fr-FR') : 'Jamais'}</p>
                    </div>

                    <button
                        className="btn-primary"
                        onClick={handleSaveProfile}
                        disabled={isUpdatingProfile}
                    >
                        {isUpdatingProfile ? 'Mise à jour...' : 'Mettre à jour le profil'}
                    </button>
                </div>
            </div>

            {/* Section Paramètres Plateforme */}
            <div className="card space-y-4">
                <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Paramètres de la Plateforme</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center justify-between">
                        <span>Mode maintenance</span>
                        <input
                            type="checkbox"
                            checked={settings.maintenance_mode || false}
                            onChange={(e) => handleUpdate("maintenance_mode", e.target.checked)}
                            disabled={mutation.isLoading}
                        />
                    </label>

                    <label className="flex items-center justify-between">
                        <span>Autoriser les nouvelles inscriptions</span>
                        <input
                            type="checkbox"
                            checked={settings.allow_new_users ?? true}
                            onChange={(e) => handleUpdate("allow_new_users", e.target.checked)}
                            disabled={mutation.isLoading}
                        />
                    </label>

                    <label className="flex items-center justify-between">
                        <span>Notifier les administrateurs</span>
                        <input
                            type="checkbox"
                            checked={settings.notify_admins ?? true}
                            onChange={(e) => handleUpdate("notify_admins", e.target.checked)}
                            disabled={mutation.isLoading}
                        />
                    </label>

                    <label className="flex items-center justify-between">
                        <span>Durée de conservation des données (jours)</span>
                        <input
                            type="number"
                            className="input w-24"
                            value={settings.data_retention_days || 365}
                            onChange={(e) => handleUpdate("data_retention_days", parseInt(e.target.value))}
                            disabled={mutation.isLoading}
                        />
                    </label>
                </div>

                <div className="border-t pt-4">
                    <label className="block space-y-2">
                        <span className="font-medium">Nom de la plateforme</span>
                        <input
                            type="text"
                            className="input w-full"
                            value={settings.platform_name || ''}
                            onChange={(e) => handleUpdate("platform_name", e.target.value)}
                            disabled={mutation.isLoading}
                        />
                    </label>
                </div>

                <div>
                    <label className="block space-y-2">
                        <span className="font-medium">Email de support</span>
                        <input
                            type="email"
                            className="input w-full"
                            value={settings.support_email || ''}
                            onChange={(e) => handleUpdate("support_email", e.target.value)}
                            disabled={mutation.isLoading}
                        />
                    </label>
                </div>
            </div>

            <button
                className="btn-primary"
                onClick={handleSave}
                disabled={mutation.isLoading}
            >
                {mutation.isLoading ? 'Sauvegarde...' : 'Enregistrer les paramètres'}
            </button>
        </main>
    );
}
