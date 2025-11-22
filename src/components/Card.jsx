// src/components/Card.jsx
// Composant de base aligné avec la classe utilitaire "card" déjà utilisée
export function Card({ className = "", children, ...rest }) {
    return (
        <div
            className={`card rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 ${className}`}
            {...rest}
        >
            {children}
        </div>
    );
}

export function CardHeader({ title, subtitle, actions }) {
    return (
        <div className="mb-3 flex items-start justify-between gap-3">
            <div>
                {title && <div className="text-base font-semibold">{title}</div>}
                {subtitle && <div className="text-sm text-slate-500">{subtitle}</div>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}

export function CardContent({ children }) {
    return <div className="space-y-3">{children}</div>;
}
