// src/components/ProfileCard.jsx
export default function ProfileCard({ user }) {
  const name = user?.name || "Utilisateur";
  const role = user?.role || "patient";
  const specialty = user?.specialty || user?.profile?.specialty;
  const languages = user?.languages || user?.profile?.languages;
  const photo =
    user?.photo && user.photo.trim() !== ""
      ? user.photo
      : "https://api.dicebear.com/9.x/initials/svg?seed=" +
        encodeURIComponent(name);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4">
      <img
        src={photo}
        alt={name}
        className="h-14 w-14 rounded-xl object-cover"
      />
      <div className="flex-1">
        <div className="font-semibold">{name}</div>
        <div className="text-sm text-slate-500 capitalize">
          {role}
          {specialty ? ` • ${specialty}` : ""}
        </div>
        {languages && (
          <div className="text-xs text-slate-500 mt-1">
            {Array.isArray(languages) ? languages.join(", ") : languages}
          </div>
        )}
      </div>
      {user?.fees && (
        <div className="text-right">
          <div className="text-xs text-slate-500">Tarif</div>
          <div className="font-medium">
            {Number(user.fees).toLocaleString()} FCFA
          </div>
        </div>
      )}
    </div>
  );
}
