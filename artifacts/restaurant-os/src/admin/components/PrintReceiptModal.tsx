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
          <div className="bg-white text-black rounded-lg p-5 font-mono text-[13px] shadow-inner">
            <div className="text-center mb-4">
              <p className="text-lg font-bold uppercase tracking-widest">{data.restaurantName}</p>
              <p className="text-xs text-gray-500">{data.type === "order" ? "Order Receipt" : "Reservation Confirmation"}</p>
              <p className="text-xs text-gray-500">{new Date().toLocaleString()}</p>
            </div>

            <div className="border-t border-dashed border-gray-300 my-3" />

            {data.type === "order" ? (
              <>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-gray-500">Order #</span><span>{data.id}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Customer</span><span>{data.customerName}</span></div>
                  {data.phone && <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{data.phone}</span></div>}
                  {data.email && <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="truncate max-w-[150px]">{data.email}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{data.date}</span></div>
                  {data.paymentMethod && <div className="flex justify-between"><span className="text-gray-500">Payment</span><span>{data.paymentMethod === "card" ? "Credit Card" : "Bank Transfer"}</span></div>}
                  {data.deliveryAddress && <div className="flex justify-between"><span className="text-gray-500">Address</span><span className="truncate max-w-[150px]">{data.deliveryAddress}</span></div>}
                </div>

                <div className="border-t border-dashed border-gray-300 my-3" />

                <div className="space-y-1">
                  {data.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span>{item.name} ×{item.quantity}</span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-gray-300 my-3" />

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(data.subtotal ?? 0)}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Delivery</span><span>{formatCurrency(data.deliveryFee ?? 0)}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Tax</span><span>{formatCurrency(data.tax ?? 0)}</span></div>
                  {(data.discount ?? 0) > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(data.discount ?? 0)}</span></div>}
                  <div className="flex justify-between font-bold text-sm border-t border-gray-200 pt-1 mt-1">
                    <span>TOTAL</span>
                    <span>{formatCurrency(data.totalAmount ?? 0)}</span>
                  </div>
                </div>

                {data.specialNotes && (
                  <>
                    <div className="border-t border-dashed border-gray-300 my-3" />
                    <p className="text-xs text-gray-500 italic">Notes: {data.specialNotes}</p>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between"><span className="text-gray-500">Reservation #</span><span>{data.id}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Guest</span><span>{data.customerName}</span></div>
                  {data.phone && <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{data.phone}</span></div>}
                  {data.email && <div className="flex justify-between"><span className="text-gray-500">Email</span><span>{data.email}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{data.date}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Time</span><span>{data.time}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Guests</span><span>{data.guests}</span></div>
                  {data.table && <div className="flex justify-between"><span className="text-gray-500">Table</span><span>{data.table}</span></div>}
                  {data.occasion && <div className="flex justify-between"><span className="text-gray-500">Occasion</span><span>{data.occasion}</span></div>}
                  {data.reservationFee != null && data.reservationFee > 0 && (
                    <>
                      <div className="border-t border-dashed border-gray-300 my-2" />
                      <div className="flex justify-between font-bold"><span>Reservation Fee</span><span>{formatCurrency(data.reservationFee)}</span></div>
                      <div className="flex justify-between text-gray-500"><span>Status</span><span className="text-green-600 font-medium">PAID</span></div>
                    </>
                  )}
                </div>
              </>
            )}

            <div className="border-t border-dashed border-gray-300 my-3" />
            <p className="text-center text-xs text-gray-500">Thank you for choosing {data.restaurantName}!</p>
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
  const items = data.type === "order" && data.items
    ? data.items.map((i) => `<div style="display:flex;justify-content:space-between;margin:4px 0"><span>${i.name} ×${i.quantity}</span><span>$${(i.price * i.quantity).toFixed(2)}</span></div>`).join("")
    : "";

  return `<!DOCTYPE html><html><head><title>Receipt</title>
  <style>body{font-family:monospace;font-size:13px;padding:24px;max-width:320px;margin:0 auto}
  h1{text-align:center;font-size:16px;letter-spacing:3px;text-transform:uppercase;margin-bottom:2px}
  .center{text-align:center}.divider{border-top:1px dashed #999;margin:10px 0}
  .row{display:flex;justify-content:space-between;margin:3px 0}
  .total{font-weight:bold;font-size:15px;border-top:1px solid #ccc;padding-top:6px;margin-top:4px}
  .label{color:#777}@media print{button{display:none}}</style></head>
  <body><h1>${data.restaurantName}</h1>
  <p class="center" style="color:#777;font-size:11px">${data.type === "order" ? "ORDER RECEIPT" : "RESERVATION CONFIRMATION"}</p>
  <p class="center" style="color:#777;font-size:11px">${new Date().toLocaleString()}</p>
  <div class="divider"></div>
  ${data.type === "order" ? `
    <div class="row"><span class="label">Order #</span><span>${data.id}</span></div>
    <div class="row"><span class="label">Customer</span><span>${data.customerName}</span></div>
    ${data.phone ? `<div class="row"><span class="label">Phone</span><span>${data.phone}</span></div>` : ""}
    ${data.date ? `<div class="row"><span class="label">Date</span><span>${data.date}</span></div>` : ""}
    ${data.paymentMethod ? `<div class="row"><span class="label">Payment</span><span>${data.paymentMethod === "card" ? "Credit Card" : "Bank Transfer"}</span></div>` : ""}
    <div class="divider"></div>
    ${items}
    <div class="divider"></div>
    <div class="row"><span class="label">Subtotal</span><span>$${(data.subtotal ?? 0).toFixed(2)}</span></div>
    <div class="row"><span class="label">Delivery</span><span>$${(data.deliveryFee ?? 0).toFixed(2)}</span></div>
    <div class="row"><span class="label">Tax</span><span>$${(data.tax ?? 0).toFixed(2)}</span></div>
    ${(data.discount ?? 0) > 0 ? `<div class="row" style="color:green"><span>Discount</span><span>-$${(data.discount ?? 0).toFixed(2)}</span></div>` : ""}
    <div class="row total"><span>TOTAL</span><span>$${(data.totalAmount ?? 0).toFixed(2)}</span></div>
  ` : `
    <div class="row"><span class="label">Reservation #</span><span>${data.id}</span></div>
    <div class="row"><span class="label">Guest</span><span>${data.customerName}</span></div>
    ${data.phone ? `<div class="row"><span class="label">Phone</span><span>${data.phone}</span></div>` : ""}
    <div class="row"><span class="label">Date</span><span>${data.date}</span></div>
    <div class="row"><span class="label">Time</span><span>${data.time}</span></div>
    <div class="row"><span class="label">Guests</span><span>${data.guests}</span></div>
    ${data.table ? `<div class="row"><span class="label">Table</span><span>${data.table}</span></div>` : ""}
    ${data.occasion ? `<div class="row"><span class="label">Occasion</span><span>${data.occasion}</span></div>` : ""}
    ${(data.reservationFee ?? 0) > 0 ? `<div class="divider"></div><div class="row total"><span>Reservation Fee PAID</span><span>$${(data.reservationFee ?? 0).toFixed(2)}</span></div>` : ""}
  `}
  <div class="divider"></div>
  <p class="center" style="color:#777">Thank you for choosing ${data.restaurantName}!</p>
  <br/><button onclick="window.print()" style="width:100%;padding:8px;cursor:pointer">🖨 Print</button>
  </body></html>`;
}
