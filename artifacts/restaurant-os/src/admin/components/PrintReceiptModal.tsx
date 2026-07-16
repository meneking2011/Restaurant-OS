import { useState, useRef, useEffect } from "react";
import { X, Printer, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatCurrency";

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

export interface ReceiptData {
  type: "order" | "reservation";
  id: string;
  restaurantName: string;
  customerName: string;
  email?: string;
  phone?: string;
  date: string;
  items?: ReceiptItem[];
  subtotal?: number;
  deliveryFee?: number;
  tax?: number;
  discount?: number;
  totalAmount?: number;
  paymentMethod?: string;
  deliveryAddress?: string;
  specialNotes?: string;
  guests?: number;
  time?: string;
  table?: string;
  occasion?: string;
  reservationFee?: number;
}

interface PrintReceiptModalProps {
  data: ReceiptData;
  onClose: () => void;
}

export function PrintReceiptModal({ data, onClose }: PrintReceiptModalProps) {
  const [printStatus, setPrintStatus] = useState<"idle" | "checking" | "error" | "success">("idle");
  const printWindowRef = useRef<Window | null>(null);

  useEffect(() => {
    return () => {
      if (printWindowRef.current && !printWindowRef.current.closed) {
        printWindowRef.current.close();
      }
    };
  }, []);

  const handlePrint = () => {
    setPrintStatus("checking");

    let printOpened = false;

    const onBeforePrint = () => {
      printOpened = true;
    };
    window.addEventListener("beforeprint", onBeforePrint, { once: true });

    const receiptHtml = generateReceiptHtml(data);
    const win = window.open("", "_blank", "width=420,height=650");

    setTimeout(() => {
      window.removeEventListener("beforeprint", onBeforePrint);
      if (!win) {
        setPrintStatus("error");
        return;
      }
      win.document.write(receiptHtml);
      win.document.close();
      win.focus();

      let afterPrintFired = false;
      const onAfterPrint = () => {
        afterPrintFired = true;
      };
      win.addEventListener("afterprint", onAfterPrint, { once: true });

      setTimeout(() => {
        win.print();
        setTimeout(() => {
          if (!afterPrintFired && !printOpened) {
            setPrintStatus("error");
          } else {
            setPrintStatus("success");
          }
        }, 1000);
      }, 300);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[hsl(15,13%,9%)] border border-white/10 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-[hsl(15,13%,9%)]">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Print Preview</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Preview */}
        <div className="p-5">
          <div className="bg-white text-black rounded-lg p-5 font-mono text-[12px] shadow-inner" style={{ maxWidth: 320, margin: "0 auto" }}>
            {/* Header */}
            <div className="text-center mb-3">
              <p className="text-base font-bold uppercase tracking-[0.2em] mb-0.5">{data.restaurantName}</p>
              <p className="text-[10px] tracking-widest text-gray-500 uppercase">
                {data.type === "order" ? "─── Order Receipt ───" : "─ Reservation Slip ─"}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                {" · "}
                {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>

            <div className="border-t border-dashed border-gray-300 my-2" />

            {data.type === "order" ? (
              <>
                {/* Order header info */}
                <div className="space-y-0.5 text-[11px] mb-2">
                  <div className="flex justify-between"><span className="text-gray-500">Order #</span><span className="font-medium">{data.id.replace("ord-", "").toUpperCase().slice(0, 8)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Customer</span><span>{data.customerName}</span></div>
                  {data.phone && <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{data.phone}</span></div>}
                  {data.paymentMethod && <div className="flex justify-between"><span className="text-gray-500">Payment</span><span>{data.paymentMethod === "card" ? "Credit Card" : "Bank Transfer"}</span></div>}
                </div>

                <div className="border-t border-dashed border-gray-300 my-2" />

                {/* Items */}
                <div className="space-y-1 mb-2">
                  {data.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-[11px]">
                      <span className="flex-1 pr-2">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                      <span className="shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-gray-300 my-2" />

                {/* Totals */}
                <div className="space-y-0.5 text-[11px]">
                  <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(data.subtotal ?? 0)}</span></div>
                  {(data.deliveryFee ?? 0) > 0 && <div className="flex justify-between text-gray-500"><span>Delivery</span><span>{formatCurrency(data.deliveryFee ?? 0)}</span></div>}
                  {(data.tax ?? 0) > 0 && <div className="flex justify-between text-gray-500"><span>Tax</span><span>{formatCurrency(data.tax ?? 0)}</span></div>}
                  {(data.discount ?? 0) > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>−{formatCurrency(data.discount ?? 0)}</span></div>}
                </div>

                <div className="border-t border-gray-300 my-1.5" />
                <div className="flex justify-between font-bold text-[13px]">
                  <span>TOTAL</span>
                  <span>{formatCurrency(data.totalAmount ?? 0)}</span>
                </div>

                {data.specialNotes && (
                  <>
                    <div className="border-t border-dashed border-gray-300 my-2" />
                    <p className="text-[10px] text-gray-500 italic">Note: {data.specialNotes}</p>
                  </>
                )}
              </>
            ) : (
              <>
                {/* Reservation info */}
                <div className="space-y-0.5 text-[11px] mb-2">
                  <div className="flex justify-between"><span className="text-gray-500">Ref #</span><span className="font-medium">{data.id.replace("res-", "").toUpperCase().slice(0, 8)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Guest</span><span className="font-medium">{data.customerName}</span></div>
                  {data.phone && <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{data.phone}</span></div>}
                  {data.email && <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-[10px]">{data.email}</span></div>}
                </div>

                <div className="border-t border-dashed border-gray-300 my-2" />

                <div className="space-y-0.5 text-[11px] mb-2">
                  <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{new Date(data.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "long", year: "numeric" })}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Time</span><span>{data.time}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Party size</span><span>{data.guests} {(data.guests ?? 1) === 1 ? "guest" : "guests"}</span></div>
                  {data.table && <div className="flex justify-between"><span className="text-gray-500">Table</span><span>{data.table}</span></div>}
                  {data.occasion && <div className="flex justify-between"><span className="text-gray-500">Occasion</span><span>{data.occasion}</span></div>}
                </div>

                {data.reservationFee != null && data.reservationFee > 0 && (
                  <>
                    <div className="border-t border-dashed border-gray-300 my-2" />
                    <div className="flex justify-between font-bold text-[13px]">
                      <span>Reservation Fee</span>
                      <span>{formatCurrency(data.reservationFee)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-green-600 font-medium mt-0.5">
                      <span>Payment Status</span>
                      <span>✓ PAID</span>
                    </div>
                  </>
                )}
              </>
            )}

            <div className="border-t border-dashed border-gray-300 my-3" />
            <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest">Thank you!</p>
            <p className="text-center text-[10px] text-gray-400 mt-0.5">{data.restaurantName}</p>
          </div>

          {/* Error / Status */}
          {printStatus === "error" && (
            <div className="mt-4 flex items-start gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-400">External printing device not connected</p>
                <p className="text-[11px] text-red-400/70 mt-0.5">Please connect a printer and try again.</p>
              </div>
            </div>
          )}

          {printStatus === "success" && (
            <div className="mt-4 flex items-center gap-2 px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-400">Sent to printer successfully.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handlePrint}
              disabled={printStatus === "checking"}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors",
                printStatus === "checking"
                  ? "bg-white/10 text-foreground/40 cursor-not-allowed"
                  : "bg-primary text-black hover:bg-primary/80"
              )}
            >
              <Printer className="w-4 h-4" />
              {printStatus === "checking" ? "Checking printer..." : "Print Receipt"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-white/5 border border-white/10 text-foreground/60 rounded-lg text-sm hover:bg-white/10 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateReceiptHtml(data: ReceiptData): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const items = data.type === "order" && data.items
    ? data.items.map((i) => {
        const total = (i.price * i.quantity).toFixed(2);
        const name  = `${i.name} x${i.quantity}`;
        return `<div class="row"><span>${name}</span><span>${total}</span></div>`;
      }).join("")
    : "";

  const orderSection = `
    <div class="row"><span class="label">Order #</span><span>${data.id.replace("ord-","").toUpperCase().slice(0,8)}</span></div>
    <div class="row"><span class="label">Customer</span><span>${data.customerName}</span></div>
    ${data.phone ? `<div class="row"><span class="label">Phone</span><span>${data.phone}</span></div>` : ""}
    ${data.paymentMethod ? `<div class="row"><span class="label">Payment</span><span>${data.paymentMethod === "card" ? "Credit Card" : "Bank Transfer"}</span></div>` : ""}
    <div class="divider"></div>
    ${items}
    <div class="divider"></div>
    <div class="row label"><span>Subtotal</span><span>${(data.subtotal ?? 0).toFixed(2)}</span></div>
    ${(data.deliveryFee ?? 0) > 0 ? `<div class="row label"><span>Delivery</span><span>${(data.deliveryFee ?? 0).toFixed(2)}</span></div>` : ""}
    ${(data.tax ?? 0) > 0 ? `<div class="row label"><span>Tax</span><span>${(data.tax ?? 0).toFixed(2)}</span></div>` : ""}
    ${(data.discount ?? 0) > 0 ? `<div class="row" style="color:#2a7a2a"><span>Discount</span><span>−${(data.discount ?? 0).toFixed(2)}</span></div>` : ""}
    <div class="solid-divider"></div>
    <div class="row total"><span>TOTAL</span><span>${(data.totalAmount ?? 0).toFixed(2)}</span></div>
    ${data.specialNotes ? `<div class="divider"></div><p class="label" style="font-style:italic">Note: ${data.specialNotes}</p>` : ""}
  `;

  const reservationDate = data.date
    ? new Date(data.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "long", year: "numeric" })
    : "";

  const reservationSection = `
    <div class="row"><span class="label">Ref #</span><span>${data.id.replace("res-","").toUpperCase().slice(0,8)}</span></div>
    <div class="row"><span class="label">Guest</span><span><b>${data.customerName}</b></span></div>
    ${data.phone ? `<div class="row"><span class="label">Phone</span><span>${data.phone}</span></div>` : ""}
    ${data.email ? `<div class="row"><span class="label">Email</span><span style="font-size:10px">${data.email}</span></div>` : ""}
    <div class="divider"></div>
    <div class="row"><span class="label">Date</span><span>${reservationDate}</span></div>
    <div class="row"><span class="label">Time</span><span>${data.time}</span></div>
    <div class="row"><span class="label">Party size</span><span>${data.guests} ${(data.guests ?? 1) === 1 ? "guest" : "guests"}</span></div>
    ${data.table ? `<div class="row"><span class="label">Table</span><span>${data.table}</span></div>` : ""}
    ${data.occasion ? `<div class="row"><span class="label">Occasion</span><span>${data.occasion}</span></div>` : ""}
    ${(data.reservationFee ?? 0) > 0 ? `
      <div class="divider"></div>
      <div class="row total"><span>Reservation Fee</span><span>${(data.reservationFee ?? 0).toFixed(2)}</span></div>
      <div class="row" style="color:#2a7a2a;font-weight:600"><span>Payment Status</span><span>✓ PAID</span></div>
    ` : ""}
  `;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Receipt — ${data.restaurantName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Courier New', Courier, monospace; font-size: 12px; padding: 20px 16px; max-width: 320px; margin: 0 auto; color: #111; }
    h1 { text-align: center; font-size: 15px; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 2px; }
    .subtitle { text-align: center; font-size: 10px; color: #666; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 2px; }
    .timestamp { text-align: center; font-size: 10px; color: #888; margin-bottom: 8px; }
    .divider { border-top: 1px dashed #aaa; margin: 8px 0; }
    .solid-divider { border-top: 1px solid #999; margin: 6px 0; }
    .row { display: flex; justify-content: space-between; margin: 3px 0; gap: 8px; }
    .row span:last-child { text-align: right; }
    .label { color: #666; }
    .total { font-weight: bold; font-size: 14px; }
    .footer { text-align: center; font-size: 10px; color: #888; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px; }
    @media print { .no-print { display: none !important; } body { padding: 0; } }
  </style></head>
  <body>
    <h1>${data.restaurantName}</h1>
    <p class="subtitle">${data.type === "order" ? "─── Order Receipt ───" : "─ Reservation Slip ─"}</p>
    <p class="timestamp">${dateStr} · ${timeStr}</p>
    <div class="divider"></div>
    ${data.type === "order" ? orderSection : reservationSection}
    <div class="divider"></div>
    <p class="footer">Thank you!</p>
    <p class="footer" style="margin-top:2px">${data.restaurantName}</p>
    <br class="no-print"/>
    <button class="no-print" onclick="window.print()" style="width:100%;padding:8px;cursor:pointer;font-family:monospace;margin-top:8px">🖨 Print Receipt</button>
  </body></html>`;
}
