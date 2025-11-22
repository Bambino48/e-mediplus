/* eslint-disable no-unused-vars */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { motion } from "framer-motion";
import {
  Download,
  FileChartColumn,
  Hospital,
  Pill,
  PlusCircle,
  RefreshCw,
  Settings,
  Shield,
  Store,
  UserCog,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Link } from "react-router-dom";
import { getReports, listPharmacies, listUsers } from "../../api/admin.js";
import AdminCard from "../../components/AdminCard.jsx";
import { useToastContext } from "../../context/ToastProvider.jsx";

// Enregistrer les éléments Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const { showError, showSuccess, showInfo } = useToastContext();
  const queryClient = useQueryClient();
  const {
    data,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: listUsers,
    onSuccess: () => {
      showSuccess("Utilisateurs chargés avec succès", "Données");
    },
    onError: (err) => {
      showError(err.message || "Erreur lors du chargement des utilisateurs");
    },
  });

  const users = data?.users || [];
  const {
    data: pharmacies,
    isLoading: pharmaciesLoading,
    error: pharmaciesError,
  } = useQuery({
    queryKey: ["pharmacies"],
    queryFn: listPharmacies,
    onSuccess: () => {
      showSuccess("Pharmacies chargées avec succès", "Données");
    },
    onError: (err) => {
      showError(err.message || "Erreur lors du chargement des pharmacies");
    },
  });

  const totalDoctors = users?.filter((u) => u.role === "doctor").length || 0;
  const totalPatients = users?.filter((u) => u.role === "patient").length || 0;
  const totalPharmacies = pharmacies?.items?.length || 0;

  // États pour l'interface
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(0);
  const [chartPeriod, setChartPeriod] = useState('7d');
  const [shortcutsLoading, setShortcutsLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  // Simulate loading for shortcuts on mount
  useEffect(() => {
    const timer = setTimeout(() => setShortcutsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Simulate loading for activity on mount
  useEffect(() => {
    const timer = setTimeout(() => setActivityLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []); // '7d', '30d', '90d'

  useEffect(() => {
    if (autoRefreshInterval > 0) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries(['users']);
        queryClient.invalidateQueries(['pharmacies']);
        queryClient.invalidateQueries(['reports']);
        showInfo("Données actualisées automatiquement", "Actualisation");
      }, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval, queryClient, showInfo]);

  // reports from backend (totals)
  const {
    data: reportsData,
    isLoading: reportsLoading,
    error: reportsError,
  } = useQuery({
    queryKey: ["adminReports"],
    queryFn: getReports,
    enabled: !!users,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: () => {
      showSuccess("Rapports chargés avec succès", "Données");
    },
    onError: (err) => {
      showError(err.message || "Impossible de charger les rapports");
    },
  });

  const mergedTotalDoctors = reportsData?.total_doctors ?? totalDoctors;
  const mergedTotalPatients = reportsData?.total_patients ?? totalPatients;
  const mergedTotalPharmacies =
    reportsData?.total_pharmacies ?? totalPharmacies;

  // Fonction pour générer les données du graphique selon la période
  const generateChartData = (period) => {
    const periods = {
      '7d': { days: 7, labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] },
      '30d': { days: 30, labels: Array.from({ length: 30 }, (_, i) => `J${i + 1}`) },
      '90d': { days: 90, labels: Array.from({ length: 90 }, (_, i) => `J${i + 1}`) },
    };

    const { days, labels } = periods[period] || periods['7d'];

    // Générer des données simulées croissantes vers les totaux actuels
    const generateDataPoints = (currentTotal, days) => {
      const points = [];
      for (let i = 0; i < days; i++) {
        const progress = (i + 1) / days;
        const baseValue = Math.floor(currentTotal * progress * 0.8); // 80% de progression
        const variation = Math.floor(Math.random() * (currentTotal * 0.2)); // variation de 20%
        points.push(Math.max(0, baseValue + variation));
      }
      return points;
    };

    return {
      labels,
      datasets: [
        {
          label: "Médecins",
          data: generateDataPoints(mergedTotalDoctors, days),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
        },
        {
          label: "Patients",
          data: generateDataPoints(mergedTotalPatients, days),
          borderColor: "rgb(16, 185, 129)",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
        },
      ],
    };
  };

  // Données du graphique d'évolution
  const chartData = generateChartData(chartPeriod);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Évolution des inscriptions (${chartPeriod === '7d' ? '7 derniers jours' : chartPeriod === '30d' ? '30 derniers jours' : '90 derniers jours'})`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Fonctions d'export
  const exportToCSV = () => {
    try {
      const csvData = [
        ['Métrique', 'Valeur'],
        ['Médecins inscrits', mergedTotalDoctors],
        ['Patients inscrits', mergedTotalPatients],
        ['Pharmacies', mergedTotalPharmacies],
        ['Centres santé', 3],
        ['Profils incomplets', reportsData?.incomplete_profiles ?? 0],
        ['Éléments à valider', reportsData?.pending_items ?? 0],
        ['Signalements récents', reportsData?.recent_reports ?? 0],
        ['', ''],
        ['Données du graphique - ' + (chartPeriod === '7d' ? '7 jours' : chartPeriod === '30d' ? '30 jours' : '90 jours')],
        ['Jour', 'Médecins', 'Patients'],
        ...chartData.labels.map((label, index) => [
          label,
          chartData.datasets[0].data[index],
          chartData.datasets[1].data[index]
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccess('Rapport CSV exporté avec succès', 'Export');
    } catch (error) {
      showError('Erreur lors de l\'export CSV', 'Export');
    }
  };

  const exportToPDF = () => {
    try {
      // Créer un contenu HTML simple pour l'impression
      const printContent = `
        <html>
          <head>
            <title>Rapport Dashboard MediPlus</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #2563eb; }
              h2 { color: #374151; margin-top: 30px; }
              .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
              .stat-card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; }
              .stat-value { font-size: 24px; font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
              th { background-color: #f9fafb; }
            </style>
          </head>
          <body>
            <h1>Rapport Dashboard MediPlus</h1>
            <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>

            <h2>Statistiques principales</h2>
            <div class="stats">
              <div class="stat-card">
                <div>Médecins inscrits</div>
                <div class="stat-value">${mergedTotalDoctors}</div>
              </div>
              <div class="stat-card">
                <div>Patients inscrits</div>
                <div class="stat-value">${mergedTotalPatients}</div>
              </div>
              <div class="stat-card">
                <div>Pharmacies</div>
                <div class="stat-value">${mergedTotalPharmacies}</div>
              </div>
              <div class="stat-card">
                <div>Centres santé</div>
                <div class="stat-value">3</div>
              </div>
            </div>

            <h2>Métriques supplémentaires</h2>
            <div class="stats">
              <div class="stat-card">
                <div>Profils incomplets</div>
                <div class="stat-value">${reportsData?.incomplete_profiles ?? 0}</div>
              </div>
              <div class="stat-card">
                <div>Éléments à valider</div>
                <div class="stat-value">${reportsData?.pending_items ?? 0}</div>
              </div>
              <div class="stat-card">
                <div>Signalements récents</div>
                <div class="stat-value">${reportsData?.recent_reports ?? 0}</div>
              </div>
            </div>

            <h2>Évolution des inscriptions (${chartPeriod === '7d' ? '7 jours' : chartPeriod === '30d' ? '30 jours' : '90 jours'})</h2>
            <table>
              <thead>
                <tr>
                  <th>Jour</th>
                  <th>Médecins</th>
                  <th>Patients</th>
                </tr>
              </thead>
              <tbody>
                ${chartData.labels.map((label, index) => `
                  <tr>
                    <td>${label}</td>
                    <td>${chartData.datasets[0].data[index]}</td>
                    <td>${chartData.datasets[1].data[index]}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();

      showSuccess('Rapport PDF ouvert dans une nouvelle fenêtre', 'Export');
    } catch (error) {
      showError('Erreur lors de l\'export PDF', 'Export');
    }
  };

  // Minimal i18n messages per document language
  const lang = (document.documentElement.lang || "fr").slice(0, 2);
  const MESSAGES = {
    fr: {
      breadcrumb: "Admin / Dashboard",
      title: "Tableau de bord administrateur 🧭",
      subtitle:
        "Vue d’ensemble des activités, utilisateurs et structures médicales.",
      doctors: "Médecins inscrits",
      patients: "Patients inscrits",
      pharmacies: "Pharmacies",
      centers: "Centres santé",
      incompleteProfiles: "Profils incomplets",
      itemsToValidate: "Éléments à valider",
      recentReports: "Signalements récents",
      addDoctor: "Ajouter un médecin",
      addPharmacy: "Ajouter une pharmacie",
      managementTitle: "Gestion & Administration",
      recentActivity: "Activité récente",
      newUser: "👤 Nouvel utilisateur inscrit",
      newPharmacy: "🏥 Nouvelle pharmacie ajoutée",
      reportHandled: "⚠️ Signalement traité",
      ago: "Il y a",
      today: "Aujourd’hui",
      evolutionTitle: "Évolution des inscriptions",
      graphPlaceholder: "Graphique bientôt disponible…",
      systemStatus: "Statut du système",
      apiStatus: "API Status",
      operational: "✓ Opérationnel",
      serverUsage: "Usage serveur",
      uptime: "Uptime",
      open: "Ouvrir →",
      loading: "Chargement...",
    },
    en: {
      breadcrumb: "Admin / Dashboard",
      title: "Admin Dashboard 🧭",
      subtitle: "Overview of activities, users, and medical structures.",
      doctors: "Registered Doctors",
      patients: "Registered Patients",
      pharmacies: "Pharmacies",
      centers: "Health Centers",
      incompleteProfiles: "Incomplete Profiles",
      itemsToValidate: "Items to Validate",
      recentReports: "Recent Reports",
      addDoctor: "Add a Doctor",
      addPharmacy: "Add a Pharmacy",
      managementTitle: "Management & Administration",
      recentActivity: "Recent Activity",
      newUser: "👤 New user registered",
      newPharmacy: "🏥 New pharmacy added",
      reportHandled: "⚠️ Report handled",
      ago: "",
      today: "Today",
      evolutionTitle: "Registration Evolution",
      graphPlaceholder: "Chart coming soon…",
      systemStatus: "System Status",
      apiStatus: "API Status",
      operational: "✓ Operational",
      serverUsage: "Server Usage",
      uptime: "Uptime",
      open: "Open →",
      loading: "Loading...",
    },
  };
  const t = MESSAGES[lang] || MESSAGES.fr;

  const shortcuts = [
    {
      title: t.doctors,
      icon: <Users className="h-5 w-5 text-white" />,
      link: "/admin/users",
      color: "from-cyan-500 to-blue-600",
      description: "Gérez les comptes médecins, patients et administrateurs.",
    },
    {
      title: t.pharmacies,
      icon: <Store className="h-5 w-5 text-white" />,
      link: "/admin/catalog",
      color: "from-emerald-500 to-teal-600",
      description:
        "Consultez et modifiez les structures médicales partenaires.",
    },
    {
      title: "Monétisation",
      icon: <Wallet className="h-5 w-5 text-white" />,
      link: "/admin/monetization",
      color: "from-amber-500 to-orange-600",
      description: "Suivez les paiements et revenus de la plateforme.",
    },
    {
      title: "Rapports",
      icon: <FileChartColumn className="h-5 w-5 text-white" />,
      link: "/admin/reports",
      color: "from-indigo-500 to-purple-600",
      description: "Analysez les statistiques globales de MediPlus.",
    },
    {
      title: "Modération",
      icon: <Shield className="h-5 w-5 text-white" />,
      link: "/admin/moderation",
      color: "from-rose-500 to-pink-600",
      description: "Surveillez et modérez les activités suspectes.",
    },
    {
      title: "Paramètres",
      icon: <Settings className="h-5 w-5 text-white" />,
      link: "/admin/settings",
      color: "from-slate-500 to-slate-700",
      description: "Personnalisez les préférences du tableau de bord.",
    },
  ];

  return (
    <>
      {/* ================= Breadcrumb ================= */}
      <nav className="text-sm text-slate-500 mb-3">
        <ol className="flex items-center gap-2">
          <li>Admin</li>
          <li>/</li>
          <li className="text-slate-300">Dashboard</li>
        </ol>
      </nav>

      {/* ================= Header ================= */}
      <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-1 mb-4">
        {t.subtitle}
      </p>
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() =>
            queryClient.invalidateQueries([
              "users",
              "pharmacies",
              "adminReports",
            ])
          }
          className="px-3 py-1 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </button>

        <div className="flex items-center gap-2">
          <label htmlFor="auto-refresh" className="text-sm text-slate-600 dark:text-slate-400">
            Actualisation auto :
          </label>
          <select
            id="auto-refresh"
            value={autoRefreshInterval}
            onChange={(e) => {
              const newInterval = Number(e.target.value);
              setAutoRefreshInterval(newInterval);
              if (newInterval > 0) {
                showSuccess(`Actualisation automatique activée (${newInterval / 1000}s)`, "Actualisation");
              } else {
                showInfo("Actualisation automatique désactivée", "Actualisation");
              }
            }}
            className="px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value={0}>Désactivé</option>
            <option value={30000}>30 sec</option>
            <option value={60000}>1 min</option>
            <option value={300000}>5 min</option>
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* ================= Statistiques principales ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {usersLoading || reportsLoading ? (
            // Skeleton loaders for stats cards - improved design
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-white dark:bg-slate-900 shadow border animate-pulse"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-slate-200 dark:bg-slate-700">
                      <div className="h-6 w-6 bg-slate-300 dark:bg-slate-600 rounded"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-1"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-12 mb-1"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
                  </div>
                </div>
                {/* Mini chart skeleton */}
                <div className="flex justify-end">
                  <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            <>
              <AdminCard
                title={t.doctors}
                value={mergedTotalDoctors}
                icon={
                  <div className="p-3 rounded-full bg-cyan-100 dark:bg-cyan-900/40">
                    <UserCog className="h-6 w-6 text-cyan-600 dark:text-cyan-300" />
                  </div>
                }
                data-testid="doctors-card"
              />

              <AdminCard
                title={t.patients}
                value={mergedTotalPatients}
                icon={
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/40">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                }
                data-testid="patients-card"
              />

              <AdminCard
                title={t.pharmacies}
                value={mergedTotalPharmacies}
                icon={
                  <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                    <Pill className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
                  </div>
                }
                data-testid="pharmacies-card"
              />

              <AdminCard
                title={t.centers}
                value={3}
                icon={
                  <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-900/40">
                    <Hospital className="h-6 w-6 text-rose-600 dark:text-rose-300" />
                  </div>
                }
                data-testid="centers-card"
              />
            </>
          )}
        </div>

        {/* ================= Mini Stats ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 shadow border" aria-label={`${t.incompleteProfiles}: ${reportsData?.incomplete_profiles ?? 0}`}>
            <p className="text-sm text-slate-500">{t.incompleteProfiles}</p>
            <h3 className="text-xl font-bold mt-2">
              {reportsLoading ? (
                <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-6 w-8 rounded"></div>
              ) : (
                reportsData?.incomplete_profiles ?? 0
              )}
            </h3>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 shadow border" aria-label={`${t.itemsToValidate}: ${reportsData?.pending_items ?? 0}`}>
            <p className="text-sm text-slate-500">{t.itemsToValidate}</p>
            <h3 className="text-xl font-bold mt-2">
              {reportsLoading ? (
                <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-6 w-8 rounded"></div>
              ) : (
                reportsData?.pending_items ?? 0
              )}
            </h3>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 shadow border" aria-label={`${t.recentReports}: ${reportsData?.recent_reports ?? 0}`}>
            <p className="text-sm text-slate-500">{t.recentReports}</p>
            <h3 className="text-xl font-bold mt-2 text-rose-500">
              {reportsLoading ? (
                <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-6 w-8 rounded"></div>
              ) : (
                reportsData?.recent_reports ?? 0
              )}
            </h3>
          </div>
        </div>

        {/* ================= Quick Actions ================= */}
        <div className="mt-12 flex gap-3 flex-wrap">
          <Link
            to="/admin/add-doctor"
            className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition"
          >
            <UserPlus className="inline h-4 w-4 mr-2" />
            {t.addDoctor}
          </Link>

          <Link
            to="/admin/add-pharmacy"
            className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition"
          >
            <PlusCircle className="inline h-4 w-4 mr-2" />
            {t.addPharmacy}
          </Link>
        </div>

        {/* ================= Shortcuts ================= */}
        <div className="mt-14">
          <h2 className="text-lg font-semibold mb-4">{t.managementTitle}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {shortcutsLoading ? (
              // Skeleton loaders for shortcuts
              Array.from({ length: shortcuts.length }).map((_, i) => (
                <div
                  key={i}
                  className="p-5 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 animate-pulse"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl bg-slate-200 dark:bg-slate-700 shadow-md">
                      <div className="h-5 w-5 bg-slate-300 dark:bg-slate-600 rounded"></div>
                    </div>
                    <div className="flex-1">
                      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-1"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              shortcuts.map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.04, translateY: -4 }}
                  transition={{ duration: 0.25 }}
                  className="p-5 rounded-xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-3 rounded-xl bg-linear-to-br ${item.color} shadow-md`}
                    >
                      {item.icon}
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>

                      <a
                        href={item.link}
                        className="text-cyan-600 dark:text-cyan-400 text-sm font-medium mt-3 inline-flex items-center gap-1 hover:gap-2 transition"
                      >
                        {t.open}
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* ================= Activité récente ================= */}
        <div className="mt-14">
          <h2 className="text-lg font-semibold mb-4">{t.recentActivity}</h2>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow border">
            {activityLoading ? (
              <ul className="space-y-3 text-sm">
                {Array.from({ length: 3 }).map((_, i) => (
                  <li key={i} className="flex justify-between animate-pulse">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span>{t.newUser}</span>
                  <span className="text-slate-400">{t.ago} 2h</span>
                </li>

                <li className="flex justify-between">
                  <span>{t.newPharmacy}</span>
                  <span className="text-slate-400">{t.ago} 5h</span>
                </li>

                <li className="flex justify-between">
                  <span>{t.reportHandled}</span>
                  <span className="text-slate-400">{t.today}</span>
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* ================= Graph ================= */}
        <div className="mt-14">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{t.evolutionTitle}</h2>
            <div className="flex items-center gap-3">
              <select
                value={chartPeriod}
                onChange={(e) => {
                  const newPeriod = e.target.value;
                  setChartPeriod(newPeriod);
                  const periodLabels = {
                    '7d': '7 jours',
                    '30d': '30 jours',
                    '90d': '90 jours'
                  };
                  showInfo(`Période du graphique changée à ${periodLabels[newPeriod]}`, "Graphique");
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="chart-period-select"
              >
                <option value="7d">7 jours</option>
                <option value="30d">30 jours</option>
                <option value="90d">90 jours</option>
              </select>

              <button
                onClick={exportToCSV}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-2 text-sm"
                title="Exporter en CSV"
              >
                <Download className="h-4 w-4" />
                CSV
              </button>

              <button
                onClick={exportToPDF}
                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center gap-2 text-sm"
                title="Exporter en PDF"
              >
                <Download className="h-4 w-4" />
                PDF
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow border" aria-label="Graphique d'évolution des inscriptions médicales">
            {reportsLoading ? (
              <div className="h-40 rounded-xl bg-slate-800/20 dark:bg-slate-700/30 animate-pulse"></div>
            ) : (
              <Line data={chartData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* ================= Statut du système ================= */}
        <div className="mt-14">
          <h2 className="text-lg font-semibold mb-4">{t.systemStatus}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border shadow">
              <p className="text-sm text-slate-500">{t.apiStatus}</p>
              <p className="font-bold text-green-500 mt-1">{t.operational}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border shadow">
              <p className="text-sm text-slate-500">{t.serverUsage}</p>
              <p className="font-bold mt-1">42%</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border shadow">
              <p className="text-sm text-slate-500">{t.uptime}</p>
              <p className="font-bold mt-1">99.97%</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
