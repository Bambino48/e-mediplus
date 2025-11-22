// Composant Card réutilisable
export default function Card({ children, className = "", ...props }) {
    return (
        <div
            className={`rounded-xl shadow-md bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-6 hover:-translate-y-1 hover:shadow-cyan-300/20 transition-all duration-300 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
