import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { motion, AnimatePresence } from "framer-motion";
import { useRestaurantStore } from "@/store/restaurantStore";
import { CalendarX, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { formatCurrency } from "@/utils/formatCurrency";

const SESSION_KEY = "ros_reservation_session";
const LOCKOUT_MS  = 2 * 60 * 60 * 1000; // 2 hours

function getSessionData(): { count: number; lastAt: number } {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {/* */}
  return { count: 0, lastAt: 0 };
}

function setSessionData(data: { count: number; lastAt: number }) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

const reservationSchema = z.object({
  firstName: z.string().min(2, "First name required"),
  lastName:  z.string().min(2, "Last name required"),
  email:     z.string().email("Invalid email"),
  phone:     z.string().min(10, "Valid phone required"),
  date:      z.string().min(1, "Date is required"),
  time:      z.string().min(1, "Time is required"),
  guests:    z.string().min(1, "Please select guest count"),
  notes:     z.string().optional(),
});

const paymentSchema = z.object({
  cardName:   z.string().min(2, "Name on card required"),
  cardNumber: z.string().regex(/^\d{16}$/, "Enter a valid 16-digit card number"),
  expiry:     z.string().regex(/^\d{2}\/\d{2}$/, "Format: MM/YY"),
  cvv:        z.string().regex(/^\d{3,4}$/, "3 or 4 digits"),
});

type ReservationFormValues = z.infer<typeof reservationSchema>;
type PaymentFormValues     = z.infer<typeof paymentSchema>;

export default function ReservationsPage() {
  const { addReservation, quickControls, reservationSettings, config } = useRestaurantStore();
  const [step, setStep]         = useState<"form" | "payment" | "success">("form");
  const [formData, setFormData] = useState<ReservationFormValues | null>(null);
  const [sessionData, setLocalSession] = useState(getSessionData);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    document.title = `Reservations | ${config.name}`;
  }, [config.name]);

  // Session lockout check (when payment is OFF)
  useEffect(() => {
    if (reservationSettings.requirePayment) return;
    const data = getSessionData();
    if (!reservationSettings.allowMultiple && data.count > 0) {
      const elapsed = Date.now() - data.lastAt;
      if (elapsed < LOCKOUT_MS) setIsLocked(true);
      else { setSessionData({ count: 0, lastAt: 0 }); setLocalSession({ count: 0, lastAt: 0 }); }
    }
    if (reservationSettings.allowMultiple && data.count >= reservationSettings.multipleLimit) {
      const elapsed = Date.now() - data.lastAt;
      if (elapsed < LOCKOUT_MS) setIsLocked(true);
      else { setSessionData({ count: 0, lastAt: 0 }); setLocalSession({ count: 0, lastAt: 0 }); }
    }
  }, [reservationSettings]);

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", date: "", time: "", guests: "", notes: "" },
  });

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { cardName: "", cardNumber: "", expiry: "", cvv: "" },
  });

  const onFormSubmit = (data: ReservationFormValues) => {
    setFormData(data);
    if (reservationSettings.requirePayment) {
      setStep("payment");
    } else {
      submitReservation(data, false);
    }
  };

  const onPaymentSubmit = (_: PaymentFormValues) => {
    if (!formData) return;
    submitReservation(formData, true);
  };

  const submitReservation = (data: ReservationFormValues, paid: boolean) => {
    addReservation({
      name:          `${data.firstName} ${data.lastName}`,
      email:         data.email,
      phone:         data.phone,
      date:          data.date,
      time:          data.time,
      guests:        parseInt(data.guests, 10) || 1,
      notes:         data.notes,
      paymentPaid:   paid,
      paymentAmount: paid ? reservationSettings.paymentAmount : undefined,
    });

    // Update session lockout
    const existing = getSessionData();
    const newData = { count: existing.count + 1, lastAt: Date.now() };
    setSessionData(newData);
    setLocalSession(newData);

    if (!reservationSettings.requirePayment) {
      if (!reservationSettings.allowMultiple || newData.count >= reservationSettings.multipleLimit) {
        setIsLocked(true);
      }
    }

    setStep("success");
  };

  const canMakeAnother = () => {
    if (reservationSettings.requirePayment) return true;
    if (!reservationSettings.allowMultiple) return false;
    return sessionData.count < reservationSettings.multipleLimit;
  };

  const resetForm = () => {
    form.reset();
    paymentForm.reset();
    setFormData(null);
    setStep("form");
  };

  // Restaurant closed, or reservations disabled
  if (!quickControls.restaurantOpen || !quickControls.acceptReservations) {
    const closedForBusiness = !quickControls.restaurantOpen;
    return (
      <Layout>
        <SectionContainer className="bg-background pt-12 md:pt-24 min-h-[70vh] flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-card p-12 border border-border rounded-sm max-w-2xl w-full"
          >
            <div className="w-20 h-20 border border-border rounded-full flex items-center justify-center mx-auto mb-8">
              <CalendarX className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl uppercase tracking-widest mb-4">
              {closedForBusiness ? "We're Currently Closed" : "Reservations Paused"}
            </h1>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {closedForBusiness
                ? "We are closed right now and not accepting reservations. Please check back during our opening hours to book a table."
                : "We are not accepting reservations online at this time. Please call us directly to book a table."}
            </p>
            <Button asChild variant="outline" className="rounded-none tracking-widest uppercase border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </motion.div>
        </SectionContainer>
      </Layout>
    );
  }

  // Session locked
  if (isLocked && step !== "success") {
    const elapsed  = Date.now() - sessionData.lastAt;
    const remaining = Math.max(0, LOCKOUT_MS - elapsed);
    const hrs  = Math.floor(remaining / 3600000);
    const mins = Math.floor((remaining % 3600000) / 60000);
    return (
      <Layout>
        <SectionContainer className="bg-background pt-12 md:pt-24 min-h-[70vh] flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-card p-12 border border-border rounded-sm max-w-2xl w-full"
          >
            <div className="w-20 h-20 border border-border rounded-full flex items-center justify-center mx-auto mb-8">
              <CalendarX className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl uppercase tracking-widest mb-4">Reservation Limit Reached</h1>
            <p className="text-muted-foreground text-lg mb-4 leading-relaxed">
              You have already placed a reservation. You may book again in:
            </p>
            <p className="text-primary font-semibold text-2xl mb-8">
              {hrs > 0 ? `${hrs}h ${mins}m` : `${mins} minutes`}
            </p>
            <p className="text-muted-foreground text-sm">
              Alternatively, close this page and return when the waiting period has expired.
            </p>
          </motion.div>
        </SectionContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <SectionContainer className="bg-background pt-12 md:pt-20">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
          <h1 className="font-serif text-3xl md:text-5xl font-medium tracking-widest uppercase mb-4">
            Restaurant Reservation
          </h1>
          <p className="text-muted-foreground">Secure your table for an unforgettable evening.</p>
          {reservationSettings.requirePayment && (
            <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-sm text-sm text-primary">
              <CreditCard className="w-4 h-4" />
              <span>A reservation fee of {formatCurrency(reservationSettings.paymentAmount)} is required to confirm your booking.</span>
            </div>
          )}
        </div>

        <div className="max-w-3xl mx-auto bg-card p-8 md:p-12 border border-border rounded-sm relative">
          {/* Steps indicator */}
          {reservationSettings.requirePayment && step !== "success" && (
            <div className="flex items-center gap-3 mb-8">
              <div className={`flex items-center gap-2 text-xs ${step === "form" ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-[11px] ${step === "form" ? "border-primary text-primary" : "border-muted-foreground bg-primary text-black"}`}>1</div>
                <span className="hidden sm:block uppercase tracking-widest">Your Details</span>
              </div>
              <div className="flex-1 h-px bg-border" />
              <div className={`flex items-center gap-2 text-xs ${step === "payment" ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-[11px] ${step === "payment" ? "border-primary text-primary" : "border-muted-foreground"}`}>2</div>
                <span className="hidden sm:block uppercase tracking-widest">Payment</span>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* Success */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-16"
              >
                <div className="w-20 h-20 border-2 border-primary rounded-full flex items-center justify-center mb-8">
                  <span className="text-primary text-3xl">✓</span>
                </div>
                <h3 className="font-serif text-3xl uppercase tracking-widest mb-4 text-foreground">Request Received</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-4 leading-relaxed">
                  {reservationSettings.confirmationMessage}
                </p>
                {formData && reservationSettings.requirePayment && (
                  <p className="text-primary text-sm mb-8">
                    Reservation fee of {formatCurrency(reservationSettings.paymentAmount)} confirmed.
                  </p>
                )}
                {canMakeAnother() && (
                  <Button
                    variant="outline"
                    className="rounded-none tracking-widest uppercase border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={resetForm}
                  >
                    Make Another Reservation
                  </Button>
                )}
              </motion.div>
            )}

            {/* Reservation Form */}
            {step === "form" && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onFormSubmit)} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">First Name</FormLabel>
                          <FormControl><Input placeholder="First Name" {...field} className="bg-background border-border rounded-none h-12" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Last Name</FormLabel>
                          <FormControl><Input placeholder="Last Name" {...field} className="bg-background border-border rounded-none h-12" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Email</FormLabel>
                          <FormControl><Input type="email" placeholder="Email Address" {...field} className="bg-background border-border rounded-none h-12" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Phone</FormLabel>
                          <FormControl><Input type="tel" placeholder="Phone Number" {...field} className="bg-background border-border rounded-none h-12" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField control={form.control} name="date" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Date</FormLabel>
                          <FormControl><Input type="date" {...field} className="bg-background border-border rounded-none h-12" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="time" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Time</FormLabel>
                          <FormControl><Input type="time" {...field} className="bg-background border-border rounded-none h-12" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="guests" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Guests</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background border-border rounded-none h-12">
                                <SelectValue placeholder="Guests" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[1,2,3,4,5,6,7,8].map((num) => (
                                <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? "Person" : "People"}</SelectItem>
                              ))}
                              <SelectItem value="9">9+ People</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Special Requests / Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Dietary requirements, special occasions..." className="bg-background border-border rounded-none min-h-[100px] resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="pt-6 flex justify-center">
                      <div className="p-1 border border-primary/40 inline-block">
                        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-16 rounded-none tracking-widest uppercase font-semibold" style={{ backgroundColor: "#c0392b", color: "#fff" }}>
                          {reservationSettings.requirePayment ? `Continue to Payment — ${formatCurrency(reservationSettings.paymentAmount)}` : "Send Request"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}

            {/* Payment Step */}
            {step === "payment" && (
              <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <h2 className="font-serif text-2xl uppercase tracking-widest text-foreground mb-2">Secure Payment</h2>
                  <p className="text-muted-foreground text-sm">
                    Complete your reservation by paying the {formatCurrency(reservationSettings.paymentAmount)} reservation fee.
                    This amount will be deducted from your final bill.
                  </p>
                </div>

                <div className="bg-background border border-border rounded-sm p-5 mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Reservation for</p>
                    <p className="font-medium text-foreground">{formData?.firstName} {formData?.lastName}</p>
                    <p className="text-sm text-muted-foreground">{formData?.date} at {formData?.time} · {formData?.guests} guests</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Fee</p>
                    <p className="text-2xl font-semibold text-primary">{formatCurrency(reservationSettings.paymentAmount)}</p>
                  </div>
                </div>

                <Form {...paymentForm}>
                  <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="flex flex-col gap-5">
                    <FormField control={paymentForm.control} name="cardName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Name on Card</FormLabel>
                        <FormControl><Input placeholder="Full name as on card" {...field} className="bg-background border-border rounded-none h-12" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={paymentForm.control} name="cardNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Card Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="1234 5678 9012 3456"
                            {...field}
                            maxLength={16}
                            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                            className="bg-background border-border rounded-none h-12 font-mono tracking-widest"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={paymentForm.control} name="expiry" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Expiry (MM/YY)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="MM/YY"
                              maxLength={5}
                              {...field}
                              onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, "");
                                if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                                field.onChange(v);
                              }}
                              className="bg-background border-border rounded-none h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={paymentForm.control} name="cvv" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">CVV</FormLabel>
                          <FormControl><Input placeholder="000" maxLength={4} {...field} className="bg-background border-border rounded-none h-12" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <CreditCard className="w-3 h-3" />
                      Your payment information is encrypted and secure.
                    </p>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep("form")}
                        className="rounded-none tracking-widest uppercase border-border text-muted-foreground"
                      >
                        Back
                      </Button>
                      <div className="flex-1 p-1 border border-primary/40">
                        <Button type="submit" className="w-full rounded-none tracking-widest uppercase font-semibold h-12" style={{ backgroundColor: "#c0392b", color: "#fff" }}>
                          Pay {formatCurrency(reservationSettings.paymentAmount)} & Confirm
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </SectionContainer>
    </Layout>
  );
}
