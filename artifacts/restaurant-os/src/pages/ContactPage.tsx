import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRestaurantStore } from "@/store/restaurantStore";
import { Phone, Mail } from "lucide-react";
import { SiFacebook, SiInstagram, SiTiktok } from "react-icons/si";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { motion, AnimatePresence } from "framer-motion";

const contactSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  subject: z.string().min(3, { message: "Subject is required" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { config } = useRestaurantStore();
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    document.title = "Contact | Reassurance";
  }, []);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: ""
    }
  });

  const onSubmit = (data: ContactFormValues) => {
    console.log("Contact submitted:", data);
    setIsSubmitted(true);
  };

  return (
    <Layout>
      <SectionContainer className="bg-background pt-12 md:pt-20">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-serif text-4xl md:text-6xl font-medium tracking-widest uppercase mb-6">
            Connect With Us
          </h1>
          <p className="text-primary font-medium tracking-widest uppercase mb-4 text-sm">
            We Believe In Open Communication
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Whether you have an inquiry about a private event, dietary accommodations, or simply wish to share your experience, we are here to listen.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
          {/* Info Panel */}
          <div className="lg:col-span-2 flex flex-col gap-10 bg-card p-8 md:p-10 border border-border rounded-sm">
            <div>
              <h2 className="text-xl font-serif tracking-widest uppercase text-primary mb-6">Contact Our Support:</h2>
              <div className="flex flex-col gap-6">
                <a href={`tel:${config.phone}`} className="flex items-center gap-4 text-foreground hover:text-primary transition-colors">
                  <div className="bg-background p-3 rounded-full border border-border">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Phone</div>
                    <div className="font-medium">{config.phone}</div>
                  </div>
                </a>
                
                <a href={`mailto:${config.email}`} className="flex items-center gap-4 text-foreground hover:text-primary transition-colors">
                  <div className="bg-background p-3 rounded-full border border-border">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Email</div>
                    <div className="font-medium">{config.email}</div>
                  </div>
                </a>
              </div>
            </div>
            
            <div className="pt-8 border-t border-border">
              <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-6">Follow Our Journey</h2>
              <div className="flex gap-6">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiInstagram className="w-6 h-6" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiFacebook className="w-6 h-6" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiTiktok className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          {/* Form Panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card p-12 border border-border flex flex-col items-center justify-center text-center h-full min-h-[400px] rounded-sm"
                >
                  <div className="w-16 h-16 border-2 border-primary rounded-full flex items-center justify-center mb-6">
                    <span className="text-primary text-2xl">✓</span>
                  </div>
                  <h3 className="font-serif text-3xl uppercase tracking-widest mb-4">Message Received</h3>
                  <p className="text-muted-foreground">
                    Thank you for reaching out. A member of our concierge team will respond to your inquiry shortly.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-8 rounded-none tracking-widest uppercase border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={() => {
                      form.reset();
                      setIsSubmitted(false);
                    }}
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" data-testid="form-contact">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} className="bg-card border-border rounded-none focus-visible:ring-primary h-12" data-testid="input-contact-name" />
                            </FormControl>
                            <FormMessage className="text-destructive" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="john@example.com" type="email" {...field} className="bg-card border-border rounded-none focus-visible:ring-primary h-12" data-testid="input-contact-email" />
                            </FormControl>
                            <FormMessage className="text-destructive" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="Private Event Inquiry" {...field} className="bg-card border-border rounded-none focus-visible:ring-primary h-12" data-testid="input-contact-subject" />
                            </FormControl>
                            <FormMessage className="text-destructive" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs uppercase tracking-widest text-muted-foreground">Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="How can we assist you?" 
                                className="bg-card border-border rounded-none focus-visible:ring-primary min-h-[150px] resize-y" 
                                {...field} 
                                data-testid="input-contact-message"
                              />
                            </FormControl>
                            <FormMessage className="text-destructive" />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 rounded-none tracking-widest uppercase font-semibold mt-4"
                        data-testid="button-submit-contact"
                      >
                        Reach Out Now
                      </Button>
                    </form>
                  </Form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </SectionContainer>
    </Layout>
  );
}
