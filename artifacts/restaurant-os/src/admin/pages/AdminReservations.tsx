import { useState } from "react";
import { useRestaurantStore, Reservation } from "@/store/restaurantStore";
import { AdminLayout } from "../layout/AdminLayout";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { PrintReceiptModal, ReceiptData } from "../components/PrintReceiptModal";
import { CalendarCheck, Download, Plus, Eye, X, Check, Clock, Printer, RotateCcw, Settings2, ChevronDown } from "lucide-react";

type StatusFilter = "all" | "pending" | "confirmed" | "seated" | "completed" | "cancelled";

const STATUS_STYLES: Record<string, string> = {
  pending:   "text-amber-400 bg-amber-400/10 border-amber-400/30",
  confirmed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  seated:    "text-blue-400 bg-blue-400/10 border-blue-400/30",
  completed: "text-foreground/50 bg-white/5 border-white/10",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/30",
};

const NEXT_STATUS: Record<string, Reservation["status"]> = {
  pending:   "confirmed",
  confirmed: "seated",
  seated:    "completed",
};

const NEXT_LABEL: Record<string, string> = {
  pending:   "Confirm Reservation",
  confirmed: "Mark as Seated",
  seated:    "Mark as Completed",
};

const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/40";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label?: string }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <button
        type="button"
        onClick={onChange}
        className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0", checked ? "bg-primary" : "bg-white/20")}
      >
        <span className={cn("inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow", checked ? "translate-x-4.5" : "translate-x-0.5")} />
      </button>
      {label && <span className="text-sm text-foreground/70">{label}</span>}
    </label>
  );
}

function exportReservationsCSV(reservations: Reservation[]) {
  const header = ["ID","Name","Email","Phone","Date","Time","Guests","Table","Occasion","Status","Notes","Created"];
  const rows = reservations.map((r) => [
    r.id, r.name, r.email, r.phone, r.date, r.time,
    r.guests, r.table ?? "", r.occasion ?? "", r.status,
    r.notes ?? "", new Date(r.createdAt).toLocaleString(),
  ]);
  const csv = [header, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `reservations-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function ReservationSettings() {
  const { reservationSettings, updateReservationSettings, quickControls, updateQuickControls } = useRestaurantStore();
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl mb-5 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-2 p-5 text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Reservation Settings</h3>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-foreground/40 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
      <div className="px-5 pb-5 space-y-5">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Accept Reservations */}
        <div className="flex items-start justify-between gap-4 p-3 bg-white/5 rounded-lg">
          <div>
            <p className="text-sm font-medium text-foreground">Accept Reservations</p>
            <p className="text-xs text-foreground/40 mt-0.5">Allow customers to book tables online</p>
          </div>
          <Toggle
            checked={quickControls.acceptReservations}
            onChange={() => updateQuickControls({ acceptReservations: !quickControls.acceptReservations })}
          />
        </div>

        {/* Reservation Payment */}
        <div className="p-3 bg-white/5 rounded-lg space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Reservation Payment</p>
              <p className="text-xs text-foreground/40 mt-0.5">Require upfront fee to secure booking</p>
            </div>
            <Toggle
              checked={reservationSettings.requirePayment}
              onChange={() => updateReservationSettings({ requirePayment: !reservationSettings.requirePayment })}
            />
          </div>
          {reservationSettings.requirePayment && (
            <div>
              <label className="text-xs text-foreground/50 mb-1 block">Fee Amount ($)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={reservationSettings.paymentAmount}
                onChange={(e) => updateReservationSettings({ paymentAmount: parseFloat(e.target.value) || 0 })}
                className={inputCls}
              />
            </div>
          )}
        </div>

        {/* Allow Multiple Reservations */}
        <div className="p-3 bg-white/5 rounded-lg space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Allow Multiple Reservations</p>
              <p className="text-xs text-foreground/40 mt-0.5">Let customers book more than once per session</p>
            </div>
            <Toggle
              checked={reservationSettings.allowMultiple}
              onChange={() => updateReservationSettings({ allowMultiple: !reservationSettings.allowMultiple })}
            />
          </div>
          {reservationSettings.allowMultiple && (
            <div>
              <label className="text-xs text-foreground/50 mb-1 block">Max Reservations per Session (1–5)</label>
              <select
                value={reservationSettings.multipleLimit}
                onChange={(e) => updateReservationSettings({ multipleLimit: parseInt(e.target.value) })}
                className="w-full bg-[hsl(15,13%,12%)] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40"
              >
                {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Max Party Size */}
        <div className="p-3 bg-white/5 rounded-lg">
          <label className="text-xs text-foreground/50 mb-1.5 block">Max Party Size</label>
          <select
            value={reservationSettings.maxPartySize}
            onChange={(e) => updateReservationSettings({ maxPartySize: parseInt(e.target.value) })}
            className="w-full bg-[hsl(15,13%,12%)] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40"
          >
            {[4,6,8,10,12,15,20].map((n) => <option key={n} value={n}>{n} guests</option>)}
          </select>
        </div>

        {/* Advance Notice */}
        <div className="p-3 bg-white/5 rounded-lg">
          <label className="text-xs text-foreground/50 mb-1.5 block">Advance Notice Required</label>
          <select
            value={reservationSettings.advanceNoticeHours}
            onChange={(e) => updateReservationSettings({ advanceNoticeHours: parseInt(e.target.value) })}
            className="w-full bg-[hsl(15,13%,12%)] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40"
          >
            <option value={0}>No notice required</option>
            <option value={2}>2 hours</option>
            <option value={4}>4 hours</option>
            <option value={12}>12 hours</option>
            <option value={24}>24 hours</option>
            <option value={48}>48 hours</option>
          </select>
        </div>

        {/* Max Advance Days */}
        <div className="p-3 bg-white/5 rounded-lg">
          <label className="text-xs text-foreground/50 mb-1.5 block">Book Up to (days in advance)</label>
          <select
            value={reservationSettings.maxAdvanceDays}
            onChange={(e) => updateReservationSettings({ maxAdvanceDays: parseInt(e.target.value) })}
            className="w-full bg-[hsl(15,13%,12%)] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40"
          >
            {[7,14,30,60,90].map((n) => <option key={n} value={n}>{n} days</option>)}
          </select>
        </div>
      </div>

      {/* Confirmation message */}
      <div>
        <label className="text-xs text-foreground/50 mb-1.5 block">Confirmation Message shown to guests</label>
        <textarea
          rows={2}
          value={reservationSettings.confirmationMessage}
          onChange={(e) => updateReservationSettings({ confirmationMessage: e.target.value })}
          className={inputCls + " resize-none"}
        />
      </div>

      <button
        onClick={save}
        className="px-4 py-2 bg-primary text-black text-sm font-medium rounded-lg hover:bg-primary/80 transition-colors"
      >
        {saved ? "Saved!" : "Save Settings"}
      </button>
      </div>
      )}
    </div>
  );
}

function ReservationDetailPanel({ reservationId, onClose, onPrint }: { reservationId: string; onClose: () => void; onPrint: () => void }) {
  const reservation = useRestaurantStore((s) => s.reservations.find((r) => r.id === reservationId));
  const { updateReservation, updateReservationStatus, deleteReservation } = useRestaurantStore();

  const [editName,     setEditName]     = useState(reservation?.name     ?? "");
  const [editEmail,    setEditEmail]    = useState(reservation?.email    ?? "");
  const [editPhone,    setEditPhone]    = useState(reservation?.phone    ?? "");
  const [editDate,     setEditDate]     = useState(reservation?.date     ?? "");
  const [editTime,     setEditTime]     = useState(reservation?.time     ?? "");
  const [editGuests,   setEditGuests]   = useState(reservation?.guests   ?? 2);
  const [editTable,    setEditTable]    = useState(reservation?.table    ?? "");
  const [editOccasion, setEditOccasion] = useState(reservation?.occasion ?? "");
  const [editNotes,    setEditNotes]    = useState(reservation?.notes    ?? "");
  const [deleteOpen,   setDeleteOpen]   = useState(false);
  const [saved,        setSaved]        = useState(false);

  if (!reservation) return null;

  const next = NEXT_STATUS[reservation.status];

  const handleSave = () => {
    updateReservation(reservation.id, {
      name: editName, email: editEmail, phone: editPhone,
      date: editDate, time: editTime, guests: Number(editGuests),
      table: editTable || undefined, occasion: editOccasion || undefined, notes: editNotes || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-[hsl(15,13%,7%)] border border-white/10 rounded-xl p-5 flex flex-col gap-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Reservation Details</h2>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-foreground/40 uppercase tracking-widest">Customer Information</p>
        <div>
          <label className="text-xs text-foreground/40 mb-1 block">Full Name</label>
          <input className={inputCls} value={editName} onChange={(e) => setEditName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-foreground/40 mb-1 block">Phone</label>
            <input className={inputCls} value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-foreground/40 mb-1 block">Email</label>
            <input className={inputCls} value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs text-foreground/40 uppercase tracking-widest mb-2">Date & Time</p>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" className={inputCls} value={editDate} onChange={(e) => setEditDate(e.target.value)} />
          <select
            className="w-full bg-[hsl(15,13%,12%)] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40"
            value={editTime}
            onChange={(e) => setEditTime(e.target.value)}
          >
            {["12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM","8:30 PM","9:00 PM","9:30 PM"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-foreground/40 mb-1 block">Guests</label>
          <select
            className="w-full bg-[hsl(15,13%,12%)] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40"
            value={editGuests}
            onChange={(e) => setEditGuests(Number(e.target.value))}
          >
            {[1,2,3,4,5,6,7,8,9,10].map((n) => <option key={n} value={n}>{n} {n === 1 ? "Person" : "People"}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-foreground/40 mb-1 block">Assigned Table</label>
          <input className={inputCls} value={editTable} onChange={(e) => setEditTable(e.target.value)} placeholder="e.g. T12" />
        </div>
      </div>

      <div>
        <label className="text-xs text-foreground/40 mb-1 block">Occasion</label>
        <select
          className="w-full bg-[hsl(15,13%,12%)] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40"
          value={editOccasion}
          onChange={(e) => setEditOccasion(e.target.value)}
        >
          <option value="">— None —</option>
          <option>Anniversary</option>
          <option>Birthday</option>
          <option>Business Dinner</option>
          <option>Date Night</option>
          <option>Celebration</option>
          <option>Other</option>
        </select>
      </div>

      <div>
        <label className="text-xs text-foreground/40 mb-1 block">Special Requests</label>
        <textarea
          className={inputCls + " resize-none"}
          rows={3}
          value={editNotes}
          onChange={(e) => setEditNotes(e.target.value)}
          placeholder="No special requests"
        />
      </div>

      {reservation.paymentPaid && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 text-xs text-emerald-400">
          ✓ Reservation fee of ${reservation.paymentAmount?.toFixed(2)} paid
        </div>
      )}

      <div>
        <p className="text-xs text-foreground/40 uppercase tracking-widest mb-2">Reservation Status</p>
        <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium capitalize inline-block", STATUS_STYLES[reservation.status])}>
          {reservation.status}
        </span>
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 text-foreground border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
        >
          <Check className="w-3.5 h-3.5" /> {saved ? "Saved!" : "Save Changes"}
        </button>

        {next && (
          <button
            onClick={() => updateReservationStatus(reservation.id, next)}
            className="w-full px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors capitalize"
          >
            {NEXT_LABEL[reservation.status] ?? `Mark as ${next}`}
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
          onClick={onPrint}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 text-foreground/60 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" /> Print Receipt
        </button>

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

function NewReservationForm({ onClose }: { onClose: () => void }) {
  const { addReservation } = useRestaurantStore();
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [phone, setPhone]     = useState("");
  const [date, setDate]       = useState("");
  const [time, setTime]       = useState("7:00 PM");
  const [guests, setGuests]   = useState("2");
  const [table, setTable]     = useState("");
  const [occasion, setOccasion] = useState("");
  const [notes, setNotes]     = useState("");
  const [error, setError]     = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !date || !time) { setError("Name, phone, date and time are required."); return; }
    addReservation({ name, email, phone, date, time, guests: parseInt(guests) || 2, table: table || undefined, occasion: occasion || undefined, notes: notes || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[hsl(15,13%,9%)] border border-white/10 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-primary" /> New Reservation
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-foreground/50 mb-1 block">Full Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Guest name" className={inputCls} required />
            </div>
            <div>
              <label className="text-xs text-foreground/50 mb-1 block">Phone *</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 000-0000" className={inputCls} required />
            </div>
          </div>
          <div>
            <label className="text-xs text-foreground/50 mb-1 block">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="guest@email.com" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-foreground/50 mb-1 block">Date *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} required />
            </div>
            <div>
              <label className="text-xs text-foreground/50 mb-1 block">Time *</label>
              <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-[hsl(15,13%,12%)] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40">
                {["12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM","8:30 PM","9:00 PM","9:30 PM"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-foreground/50 mb-1 block">Guests</label>
              <select value={guests} onChange={(e) => setGuests(e.target.value)} className="w-full bg-[hsl(15,13%,12%)] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40">
                {[1,2,3,4,5,6,7,8,9,10].map((n) => <option key={n} value={n}>{n} {n === 1 ? "Person" : "People"}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-foreground/50 mb-1 block">Table (optional)</label>
              <input value={table} onChange={(e) => setTable(e.target.value)} placeholder="e.g. T12" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="text-xs text-foreground/50 mb-1 block">Occasion (optional)</label>
            <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className="w-full bg-[hsl(15,13%,12%)] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40">
              <option value="">— Select occasion —</option>
              <option>Anniversary</option><option>Birthday</option><option>Business Dinner</option>
              <option>Date Night</option><option>Celebration</option><option>Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-foreground/50 mb-1 block">Special Requests</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Dietary needs, special arrangements..." className={inputCls + " resize-none"} />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors">
              Create Reservation
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white/5 border border-white/10 text-foreground/60 rounded-lg text-sm hover:bg-white/10 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminReservations() {
  const { reservations, resetReservations } = useRestaurantStore();
  const config = useRestaurantStore((s) => s.config);
  const [filter,      setFilter]      = useState<StatusFilter>("all");
  const [selectedId,  setSelectedId]  = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [dateFilter,  setDateFilter]  = useState<"all" | "today" | "upcoming">("all");
  const [printData,   setPrintData]   = useState<ReceiptData | null>(null);
  const [resetOpen,   setResetOpen]   = useState(false);

  const todayStr    = new Date().toISOString().slice(0, 10);

  const counts = {
    all:       reservations.length,
    pending:   reservations.filter((r) => r.status === "pending").length,
    confirmed: reservations.filter((r) => r.status === "confirmed").length,
    seated:    reservations.filter((r) => r.status === "seated").length,
    completed: reservations.filter((r) => r.status === "completed").length,
    cancelled: reservations.filter((r) => r.status === "cancelled").length,
  };
  const todaysCount   = reservations.filter((r) => r.date === todayStr).length;
  const upcomingCount = reservations.filter((r) => r.date > todayStr && r.status !== "cancelled").length;

  const allDone = reservations.length > 0 && reservations.every((r) => r.status === "completed" || r.status === "cancelled");

  const filtered = reservations
    .filter((r) => filter === "all" || r.status === filter)
    .filter((r) => {
      if (dateFilter === "today")    return r.date === todayStr;
      if (dateFilter === "upcoming") return r.date > todayStr && r.status !== "cancelled";
      return true;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleFilterClick = (key: string) => {
    if (key === "today")         { setDateFilter("today");    setFilter("all"); }
    else if (key === "upcoming") { setDateFilter("upcoming"); setFilter("all"); }
    else                         { setDateFilter("all");      setFilter(key as StatusFilter); }
  };

  const filterButtons = [
    { key: "all",       label: "All",       count: counts.all },
    { key: "today",     label: "Today's",   count: todaysCount },
    { key: "upcoming",  label: "Upcoming",  count: upcomingCount },
    { key: "confirmed", label: "Confirmed", count: counts.confirmed },
    { key: "pending",   label: "Pending",   count: counts.pending },
    { key: "seated",    label: "Seated",    count: counts.seated },
    { key: "completed", label: "Completed", count: counts.completed },
    { key: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

  const openPrintModal = (r: Reservation) => {
    const s = useRestaurantStore.getState();
    setPrintData({
      type: "reservation",
      id: r.id,
      restaurantName: config.name,
      customerName: r.name,
      email: r.email,
      phone: r.phone,
      date: r.date,
      time: r.time,
      guests: r.guests,
      table: r.table,
      occasion: r.occasion,
      reservationFee: r.paymentPaid ? (r.paymentAmount ?? s.reservationSettings.paymentAmount) : 0,
    });
  };

  return (
    <AdminLayout
      title="Reservations Manager"
      subtitle="View and manage all incoming table bookings"
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {allDone && (
            <button
              onClick={() => setResetOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset Reservations
            </button>
          )}
          <button
            onClick={() => exportReservationsCSV(filtered)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-foreground/70 rounded-lg text-xs hover:bg-white/10 transition-colors"
          >
            <Download className="w-3 h-3" /> Export CSV
          </button>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-black rounded-lg text-xs font-medium hover:bg-primary/80 transition-colors"
          >
            <Plus className="w-3 h-3" /> New Reservation
          </button>
        </div>
      }
    >
      {showNewForm && <NewReservationForm onClose={() => setShowNewForm(false)} />}
      {printData && <PrintReceiptModal data={printData} onClose={() => setPrintData(null)} />}

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset all reservations?"
        description="This will permanently delete all reservations. This cannot be undone."
        onConfirm={() => { resetReservations(); setSelectedId(null); setResetOpen(false); }}
      />

      <ReservationSettings />

      <div className={cn("grid gap-5", selectedId ? "grid-cols-1 xl:grid-cols-3" : "grid-cols-1")}>
        <div className={selectedId ? "xl:col-span-2" : ""}>
          <div className="flex gap-1.5 flex-wrap mb-4">
            {filterButtons.map(({ key, label, count }) => {
              const isActive =
                (key === "all"      && filter === "all" && dateFilter === "all") ||
                (key === "today"    && dateFilter === "today") ||
                (key === "upcoming" && dateFilter === "upcoming") ||
                (key !== "all" && key !== "today" && key !== "upcoming" && filter === key && dateFilter === "all");
              return (
                <button
                  key={key}
                  onClick={() => handleFilterClick(key)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs transition-colors border",
                    isActive
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "bg-white/5 text-foreground/50 border-white/10 hover:bg-white/10 hover:text-foreground"
                  )}
                >
                  {label} <span className="opacity-60 ml-1">{count}</span>
                </button>
              );
            })}
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
              <div className="text-center py-14 text-foreground/30 text-sm flex flex-col items-center gap-3">
                <Clock className="w-8 h-8 opacity-30" />
                {reservations.length === 0 ? "No reservations yet. Bookings from the customer site will appear here." : "No reservations match this filter."}
              </div>
            )}

            {filtered.map((r) => (
              <div
                key={r.id}
                className={cn(
                  "grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_0.7fr_0.7fr_0.7fr_0.9fr_0.8fr] items-center px-4 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors cursor-pointer gap-2 lg:gap-0",
                  selectedId === r.id && "bg-primary/5 border-primary/20"
                )}
                onClick={() => setSelectedId(selectedId === r.id ? null : r.id)}
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
                    onClick={() => setSelectedId(selectedId === r.id ? null : r.id)}
                    className="p-1.5 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors"
                    title="View / Edit"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openPrintModal(r)}
                    className="p-1.5 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors"
                    title="Print receipt"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedId && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  const r = reservations.find((r) => r.id === selectedId);
                  if (r) openPrintModal(r);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-foreground/60 rounded-lg text-sm hover:bg-white/10 transition-colors"
              >
                <Printer className="w-4 h-4" /> Print Selected Receipt
              </button>
            </div>
          )}
        </div>

        {selectedId && (
          <ReservationDetailPanel
            reservationId={selectedId}
            onClose={() => setSelectedId(null)}
            onPrint={() => {
              const r = reservations.find((r) => r.id === selectedId);
              if (r) openPrintModal(r);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}
