export default function Stars({ rating, count, size = "text-sm" }) {
  const full = Math.round(rating || 0);
  return (
    <span className={`inline-flex items-center gap-1 ${size}`}>
      <span className="text-emerald-500" aria-label={`${rating} out of 5 stars`}>
        {"★".repeat(Math.max(0, Math.min(5, full)))}
        <span className="text-stone-300">{"★".repeat(Math.max(0, 5 - full))}</span>
      </span>
      {count !== undefined && (
        <span className="text-stone-500 font-medium">
          {rating ? Number(rating).toFixed(1) : "New"} ({count})
        </span>
      )}
    </span>
  );
}