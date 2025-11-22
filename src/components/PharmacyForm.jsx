import { useState } from "react";

export default function PharmacyForm({ onSubmit, initial }) {
    const [form, setForm] = useState(initial || { name: "", address: "", phone: "", on_guard: false });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    };

    return (
        <form
            className="space-y-3"
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit?.(form);
            }}
        >
            <input name="name" className="input w-full" placeholder="Nom" value={form.name} onChange={handleChange} />
            <input name="address" className="input w-full" placeholder="Adresse" value={form.address} onChange={handleChange} />
            <input name="phone" className="input w-full" placeholder="Téléphone" value={form.phone} onChange={handleChange} />
            <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="on_guard" checked={form.on_guard} onChange={handleChange} />
                En garde aujourd’hui
            </label>
            <button className="btn-primary w-full" type="submit">
                {initial ? "Mettre à jour" : "Créer"}
            </button>
        </form>
    );
}
