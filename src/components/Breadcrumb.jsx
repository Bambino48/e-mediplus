// src/components/Breadcrumb.jsx
import { Link } from "react-router-dom";

export default function Breadcrumb({ items = [] }) {
    return (
        <nav className="text-sm text-slate-500 mb-4">
            {items.map((item, i) => (
                <span key={i}>
                    {i > 0 && <span className="mx-2">/</span>}
                    {item.to ? (
                        <Link to={item.to} className="hover:text-cyan-600">
                            {item.label}
                        </Link>
                    ) : (
                        <span>{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}
