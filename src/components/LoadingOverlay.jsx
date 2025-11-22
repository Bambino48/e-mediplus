// src/components/LoadingOverlay.jsx
export default function LoadingOverlay({ message = "Chargement en cours..." }) {
    return (
        <div className="fixed inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm z-50 grid place-items-center">
            <div className="text-center space-y-2">
                <div className="animate-spin border-4 border-cyan-500 border-t-transparent w-10 h-10 rounded-full mx-auto"></div>
                <p className="text-slate-700 dark:text-slate-300 text-sm">{message}</p>
            </div>
        </div>
    );
}
