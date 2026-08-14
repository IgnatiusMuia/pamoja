import Link from "next/link";
import Avatar from "./Avatar";

export const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-sky-50 text-sky-700 border-sky-200",
  declined: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-stone-100 text-stone-500 border-stone-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
      {status.toUpperCase()}
    </span>
  );
}

export default function BookingCard({ booking, me }) {
  const other = me.role === "traveler" ? booking.companion : booking.traveler;
  const label = me.role === "traveler" ? "Companion" : "Traveller";

  return (
    <Link
      href={`/dashboard/bookings/${booking.id}`}
      className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all block"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar user={other} />
          <div>
            <p className="font-bold text-stone-800">
              {label}: {other.name}
            </p>
            <p className="text-sm text-stone-500">
              📅 {new Date(booking.booking_date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              {booking.start_time && <> · 🕐 {booking.start_time}</>}
              {" · "}⏱ {booking.hours} hr · {booking.activity}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <StatusBadge status={booking.status} />
          <p className="mt-1.5 font-extrabold text-emerald-700 text-sm">
            {booking.total_kes.toLocaleString()} KSH
          </p>
        </div>
      </div>
      {booking.notes && (
        <p className="mt-3 text-sm text-stone-500 bg-stone-50 rounded-lg px-3 py-2">"{booking.notes}"</p>
      )}
    </Link>
  );
}