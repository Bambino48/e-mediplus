// src/pages/admin/Moderation.jsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "../../hooks/useToast.js";

async function getModerationReports() {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/moderation`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json',
        },
    });
    if (!response.ok) throw new Error('Erreur lors du chargement des signalements');
    return response.json();
}

async function updateReportStatus(reportId, status) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/moderation/${reportId}/status`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Erreur lors de la mise à jour du statut');
    return response.json();
}

export default function Moderation() {
    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedReport, setSelectedReport] = useState(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-moderation'],
        queryFn: getModerationReports,
    });

    const mutation = useMutation({
        mutationFn: ({ reportId, status }) => updateReportStatus(reportId, status),
        onSuccess: () => {
            showSuccess('Statut du signalement mis à jour avec succès');
            queryClient.invalidateQueries(['admin-moderation']);
        },
        onError: (err) => {
            showError(err.message || 'Erreur lors de la mise à jour du signalement');
        },
    });

    const handleStatusUpdate = (reportId, newStatus) => {
        mutation.mutate({ reportId, status: newStatus });
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'ouvert': return 'Ouvert';
            case 'en_cours': return 'En cours';
            case 'resolu': return 'Résolu';
            default: return status;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ouvert': return 'bg-red-50 text-red-700 border border-red-200';
            case 'en_cours': return 'bg-amber-50 text-amber-700 border border-amber-200';
            case 'resolu': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
            default: return 'bg-slate-50 text-slate-700 border border-slate-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 border border-red-300';
            case 'medium': return 'bg-orange-100 text-orange-800 border border-orange-300';
            case 'low': return 'bg-blue-100 text-blue-800 border border-blue-300';
            default: return 'bg-slate-100 text-slate-800 border border-slate-300';
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'comment': return '💬';
            case 'profile': return '👤';
            case 'advertisement': return '📢';
            case 'behavior': return '⚠️';
            default: return '📋';
        }
    };

    if (isLoading) return <div className="card grid place-items-center py-16">Chargement des signalements…</div>;
    if (error) return <div className="card text-red-600 p-4">Erreur: {error.message}</div>;

    const reports = data?.reports || [];
    const stats = data?.stats || { total: 0, open: 0, in_progress: 0, resolved: 0, high_priority: 0 };

    // Filtrer les signalements selon le statut sélectionné
    const filteredReports = statusFilter === 'all'
        ? reports
        : reports.filter(report => report.status === statusFilter);

    return (
        <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Modération & Signalements</h1>
                <div className="text-sm text-slate-500">
                    Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
                </div>
            </div>

            {/* Statistiques */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="card text-center border-l-4 border-slate-400">
                    <div className="text-2xl font-semibold text-slate-900">{stats.total}</div>
                    <div className="text-sm text-slate-500">Total</div>
                </div>
                <div className="card text-center border-l-4 border-red-400">
                    <div className="text-2xl font-semibold text-red-600">{stats.open}</div>
                    <div className="text-sm text-slate-500">Ouverts</div>
                </div>
                <div className="card text-center border-l-4 border-amber-400">
                    <div className="text-2xl font-semibold text-amber-600">{stats.in_progress}</div>
                    <div className="text-sm text-slate-500">En cours</div>
                </div>
                <div className="card text-center border-l-4 border-emerald-400">
                    <div className="text-2xl font-semibold text-emerald-600">{stats.resolved}</div>
                    <div className="text-sm text-slate-500">Résolus</div>
                </div>
                <div className="card text-center border-l-4 border-red-500">
                    <div className="text-2xl font-semibold text-red-700">{stats.high_priority}</div>
                    <div className="text-sm text-slate-500">Priorité haute</div>
                </div>
            </div>

            {/* Filtres */}
            <div className="card bg-slate-50 border border-slate-200">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-700">Filtrer par statut:</label>
                        <select
                            className="input border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Tous ({stats.total})</option>
                            <option value="ouvert">Ouverts ({stats.open})</option>
                            <option value="en_cours">En cours ({stats.in_progress})</option>
                            <option value="resolu">Résolus ({stats.resolved})</option>
                        </select>
                    </div>
                    <div className="text-sm text-slate-600">
                        Affichage de {filteredReports.length} signalement(s)
                    </div>
                </div>
            </div>

            {/* Table des signalements */}
            <div className="card overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b text-left bg-slate-100">
                            <th className="p-4 font-medium text-slate-700">ID</th>
                            <th className="p-4 font-medium text-slate-700">Type</th>
                            <th className="p-4 font-medium text-slate-700">Signalé par</th>
                            <th className="p-4 font-medium text-slate-700">Utilisateur</th>
                            <th className="p-4 font-medium text-slate-700">Message</th>
                            <th className="p-4 font-medium text-slate-700">Priorité</th>
                            <th className="p-4 font-medium text-slate-700">Statut</th>
                            <th className="p-4 font-medium text-slate-700">Date</th>
                            <th className="p-4 font-medium text-slate-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReports.map((report) => (
                            <tr key={report.id} className="border-b last:border-none hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-medium text-slate-900">#{report.id}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{getCategoryIcon(report.category)}</span>
                                        <span className="text-slate-700">{report.type}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-600">{report.reporter}</td>
                                <td className="p-4 font-medium text-slate-900">{report.reported_user}</td>
                                <td className="p-4 max-w-xs truncate text-slate-600" title={report.message}>
                                    {report.message}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                                        {report.priority === 'high' ? 'Haute' : report.priority === 'medium' ? 'Moyenne' : 'Basse'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                        {getStatusLabel(report.status)}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-600">
                                    {new Date(report.date).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <select
                                            className="input text-sm min-w-[120px] border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                            defaultValue={report.status}
                                            onChange={(e) => handleStatusUpdate(report.id, e.target.value)}
                                            disabled={mutation.isLoading}
                                        >
                                            <option value="ouvert">Ouvert</option>
                                            <option value="en_cours">En cours</option>
                                            <option value="resolu">Résolu</option>
                                        </select>
                                        <button
                                            className="btn btn-secondary text-sm hover:bg-slate-100"
                                            onClick={() => setSelectedReport(report)}
                                        >
                                            Détails
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredReports.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                        Aucun signalement trouvé pour ce filtre.
                    </div>
                )}
            </div>

            {/* Modal de détails */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Signalement #{selectedReport.id}
                                </h2>
                                <button
                                    className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded"
                                    onClick={() => setSelectedReport(null)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Type</label>
                                        <p className="flex items-center gap-2 mt-1">
                                            <span>{getCategoryIcon(selectedReport.category)}</span>
                                            <span className="text-slate-900">{selectedReport.type}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Priorité</label>
                                        <p className="mt-1">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedReport.priority)}`}>
                                                {selectedReport.priority === 'high' ? 'Haute' : selectedReport.priority === 'medium' ? 'Moyenne' : 'Basse'}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Signalé par</label>
                                        <p className="mt-1 text-slate-900">{selectedReport.reporter}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Utilisateur concerné</label>
                                        <p className="mt-1 font-medium text-slate-900">{selectedReport.reported_user}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Date</label>
                                        <p className="mt-1 text-slate-700">{new Date(selectedReport.date).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Statut</label>
                                        <p className="mt-1">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReport.status)}`}>
                                                {getStatusLabel(selectedReport.status)}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-600">Description</label>
                                    <p className="mt-1 p-3 bg-slate-50 rounded border text-slate-800">{selectedReport.message}</p>
                                </div>

                                {selectedReport.content && (
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Contenu signalé</label>
                                        <p className="mt-1 p-3 bg-red-50 border border-red-200 rounded text-red-800">
                                            {selectedReport.content}
                                        </p>
                                    </div>
                                )}

                                {selectedReport.evidence && selectedReport.evidence.length > 0 && (
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Preuves</label>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            {selectedReport.evidence.map((file, index) => (
                                                <span key={index} className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-sm text-slate-700">
                                                    {file}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                                <button
                                    className="btn btn-secondary hover:bg-slate-100"
                                    onClick={() => setSelectedReport(null)}
                                >
                                    Fermer
                                </button>
                                <select
                                    className="input border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    defaultValue={selectedReport.status}
                                    onChange={(e) => {
                                        handleStatusUpdate(selectedReport.id, e.target.value);
                                        setSelectedReport(null);
                                    }}
                                    disabled={mutation.isLoading}
                                >
                                    <option value="ouvert">Marquer comme ouvert</option>
                                    <option value="en_cours">Marquer comme en cours</option>
                                    <option value="resolu">Marquer comme résolu</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
