// src/components/ErrorBoundary.jsx
import { Component } from "react";

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        console.error("❌ Erreur capturée par ErrorBoundary :", error);
        console.error("📍 Stack trace complet :", error.stack);
        console.error("🔍 Erreur message :", error.message);
        console.error("🕒 Timestamp :", new Date().toISOString());
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-10 text-center text-red-600">
                    <h1 className="text-xl font-semibold mb-2">Oups !</h1>
                    <p>Une erreur est survenue dans cette section.</p>
                    <button
                        className="btn-primary mt-4"
                        onClick={() => location.reload()}
                    >
                        Recharger la page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
