import { useState } from "react";
import { useRestaurantStore, Reservation } from "@/store/restaurantStore";
import { AdminLayout } from "../layout/AdminLayout";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { CalendarCheck, Download, Plus, Eye, Pencil, Trash2, X, Check } from "lucide-react";

type StatusFilter = "all" | "pending" | "confirmed" | "seated" | "completed" | "cancelled";

const STATUS_STYLES: Record<string, string> = {
  pending: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  confirmed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  seated: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  completed: "text-foreground/50 bg-white/5 border-white/10",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/30",
};

const NEXT_STATUS: Record<string, Reservation["status"]> = {
  pending: "confirmed",
  confirmed: "seated",
  seated: "completed",
};

function ReservationDetailPanel({ reservation, onClose }: { reservation: Reservation; onClose: () => void }) {
  const { updateReservation, updateReservationStatus, deleteReservation } = useRestaurantStore();
  const [editTable, setEditTable] = useState(reservation.table ?? "");
  const [editNotes, setEditNotes] = useState(reservation.notes ?? "");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const next = NEXT_STATUS[reservation.status];

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/40";

  return (
    <div className="bg-[hsl(15,13%,7%)] border border-white/10 rounded-xl p-5 flex flex-col gap-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Reservation Details</h2>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-foreground/40 uppercase tracking-widest mb-2">Customer Information</p>
        <p className="text-sm font-semibold text-foreground">{reservation.name}</p>
        <p className="text-xs text-foreground/50">{reservation.phone}</p>
        <p className="text-xs text-foreground/50">{reservation.email}</p>
      </div>

      <div>
        <p className="text-xs text-foreground/40 uppercase tracking-widest mb-2">Reservation Date & Time</p>
        <div className="grid grid-cols-2 gap-2">
          <input className={inputCls} value={reservation.date} readOnly />
          <input className={inputCls} value={reservation.time} readOnly />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-foreground/40 mb-1">Number of Guests</p>
          <input className={inputCls} value={reservation.guests} readOnly />
        </div>
        <div>
          <p className="text-xs text-foreground/40 mb-1">Assigned Table</p>
          <input
            className={inputCls}
            value={editTable}
            onChange={(e) => setEditTable(e.target.value)}
            placeholder="e.g. T12"
          />
        </div>
      </div>

      {reservation.occasion && (
        <div>
          <p className="text-xs text-foreground/40 mb-1">Occasion</p>
          <p className="text-sm text-foreground/70 italic">{reservation.occasion}</p>
        </div>
      )}

      <div>
        <p className="text-xs text-foreground/40 mb-1">Special Requests</p>
        <textarea
          className={inputCls + " resize-none"}
          rows={3}
          value={editNotes}
          onChange={(e) => setEditNotes(e.target.value)}
          placeholder="No special requests"
        />
      </div>

      <div>
        <p className="text-xs text-foreground/40 uppercase tracking-widest mb-2">Reservation Status</p>
        <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium capitalize inline-block", STATUS_STYLES[reservation.status])}>
          {reservation.status}
        </span>
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
        <button
          onClick={() => {
            updateReservation(reservation.id, { table: editTable, notes: editNotes });
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 text-foreground border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
        >
          <Check className="w-3.5 h-3.5" /> Save Changes
        </button>
        {next && (
          <button
            onClick={() => updateReservationStatus(reservation.id, next)}
            className="w-full px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors capitalize"
          >
            Mark as {next}
          </button>
        )}
        {reservation.status !== "cancelled" && (
          <button
            onClick={() => updateReservationStatus(reservation.id, "cancelled")}
            className="w-full px-4 py-2 bg-red-600/10 text-red-400 border border-red-400/20 rounded-lg text-sm hover:bg-red-600/20 transition-colors"
          >
            Cancel Reservation
          </button>
        )}
        <button
          onClick={() => setDeleteOpen(true)}
          className="w-full px-4 py-2 text-red-400 text-sm hover:underline"
        >
          Delete Permanently
        </button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete reservation?"
        description="This will permanently delete the reservation. This cannot be undone."
        onConfirm={() => { deleteReservation(reservation.id); onClose(); }}
      />
    </div>
  );
}

export default function AdminReservations() {
  const { reservations } = useRestaurantStore();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<Reservation | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const counts = {
    all: reservations.length,
    pending: reservations.filter((r) => r.status === "pending").length,
    confirmed: reservations.filter((r) => r.status === "confirmed").length,
    seated: reservations.filter((r) => r.status === "seated").length,
    completed: reservations.filter((r) => r.status === "completed").length,
    cancelled: reservations.filter((r) => r.status === "cancelled").length,
  };

  const todaysCount = reservations.filter((r) => r.date === todayStr).length;
  const upcomingCount = reservations.filter((r) => r.date > todayStr && r.status !== "cancelled").length;

  const filtered = (() => {
    if (filter === "all") return reservations;
    return reservations.filter((r) => r.status === filter);
  })();

  const filterButtons: { key: StatusFilter | "today" | "upcoming"; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "today", label: "Today's", count: todaysCount },
    { key: "upcoming", label: "Upcoming", count: upcomingCount },
    { key: "confirmed", label: "Confirmed", count: counts.confirmed },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "seated", label: "Seated", count: counts.seated },
    { key: "completed", label: "Completed", count: counts.completed },
    { key: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

  const handleFilterClick = (key: string) => {
    if (key === "today") {
      setFilter("all");
    } else if (key === "upcoming") {
      setFilter("confirmed");
    } else {
      setFilter(key as StatusFilter);
    }
  };

  return (
    <AdminLayout
      title="Reservations Manager"
      subtitle="View and manage all incoming table bookings"
      actions={
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-foreground/70 rounded-lg text-xs hover:bg-white/10 transition-colors">
            <Download className="w-3 h-3" /> Export
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-black rounded-lg text-xs font-medium hover:bg-primary/80 transition-colors">
            <Plus className="w-3 h-3" /> New Reservation
          </button>
        </div>
      }
    >
      <div className={cn("grid gap-5", selected ? "grid-cols-1 xl:grid-cols-3" : "grid-cols-1")}>
        <div className={selected ? "xl:col-span-2" : ""}>
          <div className="flex gap-1.5 flex-wrap mb-4">
            {filterButtons.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => handleFilterClick(key)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs transition-colors border",
                  (filter === key || (key === "today" && filter === "all"))
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "bg-white/5 text-foreground/50 border-white/10 hover:bg-white/10 hover:text-foreground"
                )}
              >
                {label} <span className="opacity-60 ml-1">{count}</span>
              </button>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_0.7fr_0.7fr_0.7fr_0.9fr_0.8fr] text-xs text-foreground/40 uppercase tracking-widest px-4 py-3 border-b border-white/10 hidden lg:grid">
              <span>Customer</span>
              <span>Date</span>
              <span>Time</span>
              <span>Guests</span>
              <span>Table</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-14 text-foreground/30 text-sm">
                No reservations found.
              </div>
            )}

            {filtered.map((r) => (
              <div
                key={r.id}
                className={cn(
                  "grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_0.7fr_0.7fr_0.7fr_0.9fr_0.8fr] items-center px-4 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors cursor-pointer gap-2 lg:gap-0",
                  selected?.id === r.id && "bg-primary/5 border-primary/20"
                )}
                onClick={() => setSelected(selected?.id === r.id ? null : r)}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{r.name}</p>
                  <p className="text-xs text-foreground/40">{r.phone}</p>
                </div>
                <span className="text-xs text-foreground/60">{r.date}</span>
                <span className="text-xs text-foreground/60">{r.time}</span>
                <span className="text-xs text-foreground/60">{r.guests}</span>
                <span className="text-xs text-foreground/60">{r.table ?? "—"}</span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium capitalize w-fit", STATUS_STYLES[r.status])}>
                  {r.status}
                </span>
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setSelected(selected?.id === r.id ? null : r)}
                    className="p-1.5 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSelected(r)}
                    className="p-1.5 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selected && (
          <div>
            <ReservationDetailPanel
              reservation={selected}
              onClose={() => setSelected(null)}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
