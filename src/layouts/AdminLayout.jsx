import Sidebar from "../components/Sidebar.jsx";

export default function AdminLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
            {/* ================= Sidebar ================= */}
            <Sidebar
                section="admin"
                className="shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-900/40 backdrop-blur-xl"
            />

            {/* ================= MAIN ================= */}
            <main
                className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto"
            >
                {children}
            </main>
        </div>
    );
}
