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

const reservationSchema = z.object({
  firstName: z.string().min(2, { message: "First name required" }),
  lastName: z.string().min(2, { message: "Last name required" }),
  email: z.string().email({ message: "Invalid email" }),
  phone: z.string().min(10, { message: "Valid phone required" }),
  date: z.string().min(1, { message: "Date is required" }),
  time: z.string().min(1, { message: "Time is required" }),
  guests: z.string().min(1, { message: "Please select guest count" }),
  notes: z.string().optional(),
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

export default function ReservationsPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    document.title = "Reservations | Reassurance";
  }, []);

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      guests: "",
      notes: ""
    }
  });

  const onSubmit = (data: ReservationFormValues) => {
    console.log("Reservation request:", data);
    setIsSubmitted(true);
  };

  return (
    <Layout>
      <SectionContainer className="bg-background pt-12 md:pt-20">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
          <span className="text-primary text-2xl mb-4">✦</span>
          <h1 className="font-serif text-3xl md:text-5xl font-medium tracking-widest uppercase mb-4">
            Restaurant Reservation Form
          </h1>
          <p className="text-muted-foreground">
            Secure your table for an unforgettable evening.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-card p-8 md:p-12 border border-border rounded-sm relative">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-16"
              >
                <div className="w-20 h-20 border-2 border-primary rounded-full flex items-center justify-center mb-8">
                  <span className="text-primary text-3xl">✓</span>
                </div>
                <h3 className="font-serif text-3xl uppercase tracking-widest mb-4 text-foreground">Request Received</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
                  Your reservation request has been submitted. Our concierge team will contact you shortly to confirm availability for your selected date and time.
                </p>
                <Button 
                  variant="outline" 
                  className="rounded-none tracking-widest uppercase border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => {
                    form.reset();
                    setIsSubmitted(false);
                  }}
                >
                  Make Another Reservation
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" data-testid="form-reservation">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="First Name" {...field} className="bg-background border-border rounded-none h-12" data-testid="input-res-first-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last Name" {...field} className="bg-background border-border rounded-none h-12" data-testid="input-res-last-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Email Address" {...field} className="bg-background border-border rounded-none h-12" data-testid="input-res-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Phone</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="Phone Number" {...field} className="bg-background border-border rounded-none h-12" data-testid="input-res-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="bg-background border-border rounded-none h-12" data-testid="input-res-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} className="bg-background border-border rounded-none h-12" data-testid="input-res-time" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="guests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Guests</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-background border-border rounded-none h-12" data-testid="select-res-guests">
                                  <SelectValue placeholder="Guests" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[1,2,3,4,5,6,7,8].map(num => (
                                  <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'Person' : 'People'}</SelectItem>
                                ))}
                                <SelectItem value="9+">9+ People</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Special Requests / Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Dietary requirements, special occasions..." 
                              className="bg-background border-border rounded-none min-h-[100px] resize-none" 
                              {...field} 
                              data-testid="input-res-notes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-6 flex justify-center">
                      <div className="p-1 border border-primary/40 inline-block">
                        <Button 
                          type="submit" 
                          className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-16 rounded-none tracking-widest uppercase font-semibold"
                          data-testid="button-submit-reservation"
                        >
                          Send Request
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
