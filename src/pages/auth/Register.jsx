import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Register() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form);

    // Si l'utilisateur est connecté automatiquement (token fourni)
    if (result && !result.redirect_to) {
      // Vérifier le paramètre redirect dans l'URL
      const urlParams = new URLSearchParams(location.search);
      const redirectParam = urlParams.get("redirect");

      const redirect =
        redirectParam ||
        (result.role === "patient" ? "/patient/dashboard" : "/pro/dashboard");
      navigate(redirect, { replace: true });
    } else {
      // Pas de connexion automatique - rediriger vers login
      navigate("/login", {
        replace: true,
        state: {
          message:
            "Votre compte a été créé avec succès. Veuillez vous connecter.",
          email: form.email,
        },
      });
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-semibold">Créer un compte</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          className="input"
          placeholder="Nom complet"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="input"
          type="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <select
          className="input"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="patient">Patient</option>
          <option value="doctor">Médecin / Infirmier</option>
        </select>
        <button className="btn-primary w-full" disabled={isLoading}>
          {isLoading ? "Création…" : "S'inscrire"}
        </button>
      </form>
    </div>
  );
}
