import { useState } from "react";
import { useRestaurantStore } from "@/store/restaurantStore";
import { AdminLayout } from "../layout/AdminLayout";
import { cn } from "@/lib/utils";
import { CalendarCheck, Clock, Users, CheckCircle, XCircle, Hourglass, ChevronDown } from "lucide-react";

type StatusFilter = "all" | "pending" | "confirmed" | "cancelled";

const statusColors = {
  pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  confirmed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
};

const statusIcons = {
  pending: Hourglass,
  confirmed: CheckCircle,
  cancelled: XCircle,
};

export default function AdminReservations() {
  const { reservations, updateReservationStatus } = useRestaurantStore();
  const [filter, setFilter] = useState<StatusFilter>("all");

  const filtered =
    filter === "all" ? reservations : reservations.filter((r) => r.status === filter);

  const counts = {
    all: reservations.length,
    pending: reservations.filter((r) => r.status === "pending").length,
    confirmed: reservations.filter((r) => r.status === "confirmed").length,
    cancelled: reservations.filter((r) => r.status === "cancelled").length,
  };

  return (
    <AdminLayout
      title="Reservations"
      subtitle="View and manage all incoming table bookings"
    >
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "confirmed", "cancelled"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm capitalize transition-colors border",
              filter === s
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-white/5 text-foreground/60 border-white/10 hover:bg-white/10 hover:text-foreground"
            )}
          >
            {s} <span className="ml-1 text-xs opacity-60">({counts[s]})</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-foreground/40 text-sm">
            No reservations found.
          </div>
        )}
        {filtered.map((r) => {
          const StatusIcon = statusIcons[r.status];
          return (
            <div
              key={r.id}
              className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row sm:items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{r.name}</p>
                    <p className="text-xs text-foreground/50 mt-0.5">{r.email} · {r.phone}</p>
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium capitalize shrink-0",
                      statusColors[r.status]
                    )}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {r.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-foreground/70">
                  <span className="flex items-center gap-1.5">
                    <CalendarCheck className="w-3.5 h-3.5 text-primary" />
                    {r.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {r.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    {r.guests} guest{r.guests !== 1 ? "s" : ""}
                  </span>
                  {r.occasion && (
                    <span className="text-foreground/50 italic">{r.occasion}</span>
                  )}
                </div>

                {r.notes && (
                  <p className="text-xs text-foreground/50 mt-2 italic border-l-2 border-primary/30 pl-3">
                    {r.notes}
                  </p>
                )}
              </div>

              {r.status !== "cancelled" && (
                <div className="flex gap-2 shrink-0">
                  {r.status === "pending" && (
                    <button
                      onClick={() => updateReservationStatus(r.id, "confirmed")}
                      className="px-3 py-1.5 rounded-lg text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-400/20 hover:bg-emerald-600/30 transition-colors"
                    >
                      Confirm
                    </button>
                  )}
                  <button
                    onClick={() => updateReservationStatus(r.id, "cancelled")}
                    className="px-3 py-1.5 rounded-lg text-xs bg-red-600/10 text-red-400 border border-red-400/20 hover:bg-red-600/20 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
