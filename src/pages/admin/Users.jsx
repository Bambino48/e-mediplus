import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { listUsers, updateUserRole } from "../../api/admin.js";
import { useToast } from "../../hooks/useToast.js";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["adminUsers", page, debouncedQ],
    queryFn: () => listUsers({ page, q: debouncedQ }),
    onError: (err) =>
      showError(err.message || "Impossible de charger les utilisateurs"),
    keepPreviousData: true,
  });

  const users =
    Array.isArray(usersData) || Array.isArray(usersData?.items)
      ? Array.isArray(usersData)
        ? usersData
        : usersData.items
      : usersData?.users ?? usersData?.data ?? [];

  const currentPage =
    usersData?.meta?.current_page ?? usersData?.current_page ?? page;
  const lastPage =
    usersData?.meta?.last_page ??
    usersData?.last_page ??
    usersData?.lastPage ??
    1;

  const mutation = useMutation({
    mutationFn: ({ id, role }) => updateUserRole(id, role),
    onSuccess: () => {
      showSuccess("Rôle mis à jour");
      queryClient.invalidateQueries(["adminUsers"]);
    },
    onError: (err) => showError(err.message || "Échec mise à jour rôle"),
  });

  // Confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [targetRole, setTargetRole] = useState(null);

  const lastFocusedRef = useRef(null);
  const confirmBtnRef = useRef(null);

  function requestRoleChange(user, role) {
    setTargetUser(user);
    setTargetRole(role);
    setConfirmOpen(true);
  }

  function confirmRoleChange() {
    if (!targetUser || !targetRole) return;
    mutation.mutate({ id: targetUser.id, role: targetRole });
    setConfirmOpen(false);
    setTargetUser(null);
    setTargetRole(null);
  }

  // focus management when modal opens/closes
  useEffect(() => {
    if (confirmOpen) {
      lastFocusedRef.current = document.activeElement;
      setTimeout(() => confirmBtnRef.current?.focus(), 50);
    } else {
      try {
        lastFocusedRef.current?.focus?.();
      } catch (e) {
        // noop
      }
    }
  }, [confirmOpen]);

  // Minimal i18n messages per document language
  const lang = (document.documentElement.lang || "fr").slice(0, 2);
  const MESSAGES = {
    fr: {
      title: "Gestion des utilisateurs",
      searchPlaceholder: "Rechercher par nom ou email...",
      loading: "Chargement...",
      noUsers: "Aucun utilisateur trouvé",
      page: "Page",
      prev: "Préc.",
      next: "Suiv.",
      confirmTitle: "Confirmer le changement de rôle",
      confirmMessage: (name, role) =>
        `Souhaitez-vous vraiment changer le rôle de ${name} vers ${role} ?`,
      cancel: "Annuler",
      confirm: "Confirmer",
      usersCount: (n) => `${n} utilisateur(s)`,
    },
    en: {
      title: "User management",
      searchPlaceholder: "Search by name or email...",
      loading: "Loading...",
      noUsers: "No users found",
      page: "Page",
      prev: "Prev",
      next: "Next",
      confirmTitle: "Confirm role change",
      confirmMessage: (name, role) => `Change ${name}'s role to ${role}?`,
      cancel: "Cancel",
      confirm: "Confirm",
      usersCount: (n) => `${n} user(s)`,
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
          <li className="text-slate-300">Utilisateurs</li>
        </ol>
      </nav>

      {/* ================= Header ================= */}
      <h1 className="text-3xl font-bold tracking-tight mb-4">{t.title}</h1>

      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow border">
        <div className="flex items-center justify-between mb-4">
          <input
            aria-label={t.searchPlaceholder}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder={t.searchPlaceholder}
            className="input input-sm w-72"
          />

          <div className="text-sm text-slate-500">
            {t.page} {currentPage} / {lastPage}
          </div>
        </div>

        {isLoading ? (
          // Skeleton loader for accessibility and perceived performance
          <table className="w-full text-sm" aria-hidden="true">
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2 animate-pulse">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48"></div>
                  </td>
                  <td className="py-2 animate-pulse">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-64"></div>
                  </td>
                  <td className="py-2 animate-pulse">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
                  </td>
                  <td className="py-2 animate-pulse">
                    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-40"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th scope="col" className="py-2">
                  Nom
                </th>
                <th scope="col" className="py-2">
                  Email
                </th>
                <th scope="col" className="py-2">
                  Rôle
                </th>
                <th scope="col" className="py-2">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="py-2">{u.name}</td>
                  <td className="py-2 text-slate-500">{u.email}</td>
                  <td className="py-2 capitalize">{u.role}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => requestRoleChange(u, "admin")}
                        className="px-2 py-1 rounded bg-cyan-600 text-white text-xs"
                      >
                        Make admin
                      </button>
                      <button
                        onClick={() => requestRoleChange(u, "doctor")}
                        className="px-2 py-1 rounded bg-emerald-600 text-white text-xs"
                      >
                        Make doctor
                      </button>
                      <button
                        onClick={() => requestRoleChange(u, "patient")}
                        className="px-2 py-1 rounded bg-slate-600 text-white text-xs"
                      >
                        Make patient
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-600" aria-live="polite">
            {users.length === 0 ? t.noUsers : t.usersCount(users.length)}
          </div>

          <div className="flex items-center gap-2" aria-label="Pagination">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="btn-ghost btn-xs"
            >
              {t.prev}
            </button>
            <button
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={currentPage >= lastPage}
              className="btn-ghost btn-xs"
            >
              {t.next}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmOpen(false)}
            aria-hidden="true"
          />

          <div className="relative max-w-md w-full bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg border">
            <h3 id="confirm-title" className="text-lg font-semibold mb-2">
              {t.confirmTitle}
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              {t.confirmMessage(targetUser?.name || "", targetRole)}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="btn-ghost"
              >
                {t.cancel}
              </button>
              <button
                ref={confirmBtnRef}
                onClick={confirmRoleChange}
                className="btn-primary"
                disabled={mutation.isLoading}
              >
                {mutation.isLoading ? t.loading : t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
