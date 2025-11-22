// src/pages/static/Contact.jsx
import { useState } from "react";

export default function Contact() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const submit = (e) => {
        e.preventDefault();
        alert("Message envoyé ! (simulation)");
        setForm({ name: "", email: "", message: "" });
    };

    return (
        <main className="max-w-2xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-semibold mb-4">Contact</h1>
            <form onSubmit={submit} className="card space-y-3">
                <input className="input" placeholder="Nom" value={form.name} onChange={(e) => update("name", e.target.value)} />
                <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} />
                <textarea className="input min-h-[120px]" placeholder="Votre message..." value={form.message} onChange={(e) => update("message", e.target.value)} />
                <button className="btn-primary self-start">Envoyer</button>
            </form>
        </main>
    );
}
