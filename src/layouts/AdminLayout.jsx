import { motion } from "framer-motion";
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
            <motion.main
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto"
            >
                {children}
            </motion.main>
        </div>
    );
}