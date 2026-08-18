const COLORS = [
  "bg-emerald-600", "bg-emerald-700", "bg-emerald-500", "bg-emerald-800",
  "bg-stone-600", "bg-stone-700", "bg-emerald-900", "bg-stone-800",
];

export default function Avatar({ user, size = "md", className = "" }) {
  const name = user?.name || "?";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const color = COLORS[(name.charCodeAt(0) + (name.length || 0)) % COLORS.length];

  const sizes = { sm: "h-8 w-8 text-xs", md: "h-12 w-12 text-base", lg: "h-24 w-24 text-2xl" };

  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-white shadow ${className}`}
      />
    );
  }
  return (
    <div
      className={`${sizes[size]} ${color} rounded-full flex items-center justify-center font-bold text-white ring-2 ring-white shadow ${className}`}
    >
      {initials}
    </div>
  );
}