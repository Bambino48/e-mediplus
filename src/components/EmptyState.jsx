// src/components/EmptyState.jsx
export default function EmptyState({ icon, title, message, action }) {
    return (
        <div className="text-center py-20 space-y-2 text-slate-500">
            <div className="text-4xl">{icon || "📄"}</div>
            <div className="font-medium">{title}</div>
            <div className="text-sm">{message}</div>
            {action && <div className="mt-3">{action}</div>}
        </div>
    );
}
