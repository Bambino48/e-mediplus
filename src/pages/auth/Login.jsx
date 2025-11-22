import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const { login, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: location.state?.email || "",
    password: "",
  });
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState("");

  // Récupérer le message depuis l'état de navigation
  const successMessage = location.state?.message;

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const loggedUser = await login(form);
      // Vérifier d'abord le paramètre redirect dans l'URL
      const urlParams = new URLSearchParams(location.search);
      const redirectParam = urlParams.get("redirect");

      const redirect =
        redirectParam ||
        (loggedUser.role === "admin"
          ? "/admin/dashboard"
          : loggedUser.role === "patient"
          ? "/patient/dashboard"
          : "/pro/dashboard");
      setRedirectPath(redirect);
      setShouldRedirect(true);
    } catch {
      // Erreur déjà gérée dans le hook useAuth
    }
  };

  // ✅ Redirection après connexion réussie
  useEffect(() => {
    if (shouldRedirect && user && !isLoading) {
      navigate(redirectPath, { replace: true });
      setShouldRedirect(false);
    }
  }, [shouldRedirect, user, isLoading, navigate, redirectPath]);

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-semibold">Connexion</h1>

      {successMessage && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">{successMessage}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button className="btn-primary w-full" disabled={isLoading}>
          {isLoading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
      <p className="mt-3 text-sm text-slate-500">
        Pas de compte ?{" "}
        <Link to="/register" className="text-cyan-600">
          Inscription
        </Link>
      </p>
    </div>
  );
}
