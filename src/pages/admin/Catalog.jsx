import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPharmacy,
  deletePharmacy,
  listPharmacies,
} from "../../api/admin.js";
import PharmacyForm from "../../components/PharmacyForm.jsx";
import { useAppToast } from "../../hooks/useAppToast";

export default function Catalog() {
  const qc = useQueryClient();
  const toast = useAppToast();
  const { data, isLoading } = useQuery({
    queryKey: ["pharmacies"],
    queryFn: listPharmacies,
  });

  const addMutation = useMutation({
    mutationFn: createPharmacy,
    onSuccess: () => {
      qc.invalidateQueries(["pharmacies"]);
      toast.success("Pharmacie ajoutée");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePharmacy,
    onSuccess: () => {
      qc.invalidateQueries(["pharmacies"]);
      toast.success("Pharmacie supprimée");
    },
  });

  // Minimal i18n messages per document language
  const lang = (document.documentElement.lang || "fr").slice(0, 2);
  const MESSAGES = {
    fr: {
      title: "Catalogue santé",
      addPharmacy: "Ajouter une pharmacie",
      name: "Nom",
      address: "Adresse",
      guard: "Garde",
      yes: "🌙 Oui",
      no: "—",
      delete: "Supprimer",
      loading: "Chargement…",
    },
    en: {
      title: "Health Catalog",
      addPharmacy: "Add a Pharmacy",
      name: "Name",
      address: "Address",
      guard: "Guard",
      yes: "🌙 Yes",
      no: "—",
      delete: "Delete",
      loading: "Loading…",
    },
  };
  const t = MESSAGES[lang] || MESSAGES.fr;

  return (
    <>
      {/* ================= Breadcrumb ================= */}
      <nav className="text-sm text-slate-500 mb-3">
        <ol className="flex items-center gap-2">
          <li>Admin</li>
          <li>/</li>
          <li className="text-slate-300">Catalogue</li>
        </ol>
      </nav>

      {/* ================= Header ================= */}
      <h1 className="text-3xl font-bold tracking-tight mb-6">{t.title}</h1>

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="card">
          <h2 className="font-medium mb-3">{t.addPharmacy}</h2>
          <PharmacyForm onSubmit={(form) => addMutation.mutate(form)} />
        </div>

        <div className="card overflow-x-auto">
          {isLoading ? (
            <div className="py-8 text-center">
              <table className="min-w-full text-sm" aria-hidden="true">
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-none">
                      <td className="py-2 animate-pulse">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
                      </td>
                      <td className="py-2 animate-pulse">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48"></div>
                      </td>
                      <td className="py-2 animate-pulse">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
                      </td>
                      <td className="py-2 animate-pulse">
                        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th>{t.name}</th>
                  <th>{t.address}</th>
                  <th>{t.guard}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((p) => (
                  <tr key={p.id} className="border-b last:border-none">
                    <td>{p.name}</td>
                    <td>{p.address}</td>
                    <td>{p.on_guard ? t.yes : t.no}</td>
                    <td>
                      <button
                        className="btn-ghost text-xs text-red-600"
                        onClick={() => deleteMutation.mutate(p.id)}
                      >
                        {t.delete}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

