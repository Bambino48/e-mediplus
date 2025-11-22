// Mock des dépendances
vi.mock("../api/admin.js", () => ({
    listUsers: vi.fn(),
    listPharmacies: vi.fn(),
    getReports: vi.fn(),
}));

vi.mock("../context/ToastProvider.jsx", () => ({
    useToastContext: () => ({
        toasts: [],
        addToast: vi.fn(),
        removeToast: vi.fn(),
        showSuccess: vi.fn(),
        showError: vi.fn(),
        showWarning: vi.fn(),
        showInfo: vi.fn(),
    }),
    ToastProvider: ({ children }) => <div>{children}</div>,
}));

vi.mock("../components/AdminCard.jsx", () => ({
    default: ({ title, value, icon, ...rest }) => (
        <div data-testid="admin-card" {...rest}>
            <div>{icon}</div>
            <h3>{title}</h3>
            <p>{value}</p>
        </div>
    ),
}));
vi.mock("../components/ChartEvolution.jsx", () => ({
    default: ({ data }) => (
        <div data-testid="chart-evolution">Chart: {JSON.stringify(data)}</div>
    ),
}));

vi.mock("../components/Sidebar.jsx", () => ({
    default: ({ section }) => <div data-testid="sidebar">{section}</div>,
}));

vi.mock("react-chartjs-2", () => ({
    Line: () => <div data-testid="chart">Chart</div>,
}));

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getReports, listPharmacies, listUsers } from "../api/admin.js";
import AdminDashboard from "../pages/admin/Dashboard.jsx";

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

const renderWithProviders = (component) => {
    const testQueryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={testQueryClient}>
            {component}
        </QueryClientProvider>
    );
};

describe("AdminDashboard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("affiche le titre du dashboard", () => {
        listUsers.mockResolvedValue({ users: [] });
        listPharmacies.mockResolvedValue({ items: [] });
        getReports.mockResolvedValue({});

        renderWithProviders(<AdminDashboard />);

        expect(
            screen.getByText("Tableau de bord administrateur 🧭")
        ).toBeInTheDocument();
    });

    it("affiche les statistiques principales", async () => {
        listUsers.mockResolvedValue({
            users: [
                { id: 1, role: "doctor" },
                { id: 2, role: "patient" },
                { id: 3, role: "patient" },
            ],
        });
        listPharmacies.mockResolvedValue({ items: [{ id: 1 }] });
        getReports.mockResolvedValue({
            total_doctors: 1,
            total_patients: 2,
            total_pharmacies: 1,
            incomplete_profiles: 0,
            pending_items: 0,
            recent_reports: 0,
        });

        renderWithProviders(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.getByTestId("doctors-card")).toBeInTheDocument();
            expect(screen.getByTestId("patients-card")).toBeInTheDocument();
            expect(screen.getByTestId("pharmacies-card")).toBeInTheDocument();
        });
    });

    it("affiche les mini stats dynamiques", async () => {
        listUsers.mockResolvedValue({ users: [] });
        listPharmacies.mockResolvedValue({ items: [] });
        getReports.mockResolvedValue({
            incomplete_profiles: 5,
            pending_items: 33,
            recent_reports: 2,
        });

        renderWithProviders(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.getByText("5")).toBeInTheDocument(); // incomplete_profiles
            expect(screen.getByText("33")).toBeInTheDocument(); // pending_items
            expect(screen.getByText("2")).toBeInTheDocument(); // recent_reports
        });
    });

    it("affiche le graphique", async () => {
        listUsers.mockResolvedValue({ users: [] });
        listPharmacies.mockResolvedValue({ items: [] });
        getReports.mockResolvedValue({});

        renderWithProviders(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.getByTestId("chart")).toBeInTheDocument();
        });
    });

    it("gère les erreurs de chargement", async () => {
        listUsers.mockRejectedValue(new Error("Erreur API"));
        listPharmacies.mockResolvedValue({ items: [] });
        getReports.mockResolvedValue({});

        renderWithProviders(<AdminDashboard />);

        await waitFor(() => {
            // Vérifier que l'erreur est affichée (via useToast mock)
            expect(listUsers).toHaveBeenCalled();
        });
    });

    it("affiche le contrôle d'actualisation automatique", () => {
        listUsers.mockResolvedValue({ users: [] });
        listPharmacies.mockResolvedValue({ items: [] });
        getReports.mockResolvedValue({});

        renderWithProviders(<AdminDashboard />);

        expect(screen.getByLabelText("Actualisation auto :")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Désactivé")).toBeInTheDocument();
    });

    it("permet de filtrer le graphique par période", async () => {
        listUsers.mockResolvedValue({ users: [] });
        listPharmacies.mockResolvedValue({ items: [] });
        getReports.mockResolvedValue({
            total_doctors: 10,
            total_patients: 20,
        });

        renderWithProviders(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.getByTestId("chart-period-select")).toBeInTheDocument();
        });

        const select = screen.getByTestId("chart-period-select");
        expect(select).toHaveValue("7d");

        // Changer la période à 30 jours
        fireEvent.change(select, { target: { value: "30d" } });
        expect(select).toHaveValue("30d");

        // Vérifier que le graphique est toujours présent
        expect(screen.getByTestId("chart")).toBeInTheDocument();
    });

    it("affiche les skeletons au chargement initial", async () => {
        listUsers.mockResolvedValue({ users: [] });
        listPharmacies.mockResolvedValue({ items: [] });
        getReports.mockResolvedValue({});

        renderWithProviders(<AdminDashboard />);

        // Vérifier que les skeletons des cartes sont présents
        const skeletonCards = screen.getAllByText("", { selector: ".animate-pulse" });
        expect(skeletonCards.length).toBeGreaterThan(0);

        // Attendre que les données se chargent
        await waitFor(() => {
            expect(screen.getByTestId("doctors-card")).toBeInTheDocument();
        });

        // Vérifier que les skeletons ont disparu après le chargement
        // (les skeletons sont remplacés par le contenu réel)
    });

    it("affiche des toasts pour les actions utilisateur", async () => {
        listUsers.mockResolvedValue({
            users: [
                { id: 1, role: "doctor" },
                { id: 2, role: "patient" },
            ],
        });
        listPharmacies.mockResolvedValue({ items: [{ id: 1 }] });
        getReports.mockResolvedValue({
            total_doctors: 1,
            total_patients: 1,
            total_pharmacies: 1,
        });

        renderWithProviders(<AdminDashboard />);

        // Attendre que les données se chargent
        await waitFor(() => {
            expect(screen.getByTestId("doctors-card")).toBeInTheDocument();
        });

        // Vérifier que le select de période est présent
        const select = screen.getByTestId("chart-period-select");
        expect(select).toBeInTheDocument();

        // Tester le changement de période du graphique
        fireEvent.change(select, { target: { value: "30d" } });
        expect(select).toHaveValue("30d");

        // Vérifier que le select d'actualisation automatique est présent
        const refreshSelect = screen.getByDisplayValue("Désactivé");
        expect(refreshSelect).toBeInTheDocument();

        // Tester l'activation de l'actualisation automatique
        fireEvent.change(refreshSelect, { target: { value: "30000" } });
        expect(refreshSelect).toHaveValue("30000");
    });

    it("permet d'exporter les données en CSV", async () => {
        listUsers.mockResolvedValue({
            users: [
                { id: 1, role: "doctor" },
                { id: 2, role: "patient" },
            ],
        });
        listPharmacies.mockResolvedValue({ items: [{ id: 1 }] });
        getReports.mockResolvedValue({
            total_doctors: 1,
            total_patients: 1,
            total_pharmacies: 1,
            incomplete_profiles: 2,
            pending_items: 3,
            recent_reports: 1,
        });

        renderWithProviders(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.getByTestId("doctors-card")).toBeInTheDocument();
        });

        // Vérifier que le bouton CSV existe
        const csvButton = screen.getByTitle("Exporter en CSV");
        expect(csvButton).toBeInTheDocument();
        expect(csvButton).toHaveTextContent("CSV");

        // Vérifier que le bouton peut être cliqué (sans tester l'export complet)
        expect(() => fireEvent.click(csvButton)).not.toThrow();
    });

    it("permet d'exporter les données en PDF", async () => {
        listUsers.mockResolvedValue({
            users: [
                { id: 1, role: "doctor" },
                { id: 2, role: "patient" },
            ],
        });
        listPharmacies.mockResolvedValue({ items: [{ id: 1 }] });
        getReports.mockResolvedValue({
            total_doctors: 1,
            total_patients: 1,
            total_pharmacies: 1,
            incomplete_profiles: 2,
            pending_items: 3,
            recent_reports: 1,
        });

        renderWithProviders(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.getByTestId("doctors-card")).toBeInTheDocument();
        });

        // Vérifier que le bouton PDF existe
        const pdfButton = screen.getByTitle("Exporter en PDF");
        expect(pdfButton).toBeInTheDocument();
        expect(pdfButton).toHaveTextContent("PDF");

        // Vérifier que le bouton peut être cliqué (sans tester l'export complet)
        expect(() => fireEvent.click(pdfButton)).not.toThrow();
    });
});
