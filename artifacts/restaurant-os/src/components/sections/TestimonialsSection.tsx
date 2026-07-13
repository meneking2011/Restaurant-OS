import { useState } from "react";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { useRestaurantStore } from "@/store/restaurantStore";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/utils/cn";

export function TestimonialsSection() {
  const { testimonials, addTestimonial } = useRestaurantStore();
  const [showForm, setShowForm]   = useState(false);
  const [name, setName]           = useState("");
  const [text, setText]           = useState("");
  const [rating, setRating]       = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || text.trim().length < 10) {
      setError("Please enter your name and a review of at least 10 characters.");
      return;
    }
    addTestimonial({ name: name.trim(), text: text.trim(), rating, date: new Date().toISOString().slice(0, 10) });
    setSubmitted(true);
    setName("");
    setText("");
    setRating(5);
    setError("");
  };

  return (
    <SectionContainer className="bg-card">
      <div className="flex flex-col items-center mb-16 gap-4">
        <h2 className="font-serif text-3xl md:text-5xl tracking-widest uppercase text-center">
          What Our Guests Say
        </h2>
        {!showForm && (
          <Button
            variant="outline"
            className="rounded-none tracking-widest uppercase border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => { setShowForm(true); setSubmitted(false); }}
            data-testid="button-leave-review"
          >
            Leave a Review
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-xl mx-auto mb-16 overflow-hidden"
          >
            <div className="bg-background/60 border border-border/50 rounded-sm p-6 md:p-8">
              {submitted ? (
                <div className="text-center py-6">
                  <p className="font-serif text-2xl uppercase tracking-widest text-primary mb-2">Thank You!</p>
                  <p className="text-muted-foreground mb-6">Your review has been published and our team has been notified.</p>
                  <Button variant="ghost" className="uppercase tracking-widest text-muted-foreground hover:text-primary" onClick={() => setShowForm(false)}>
                    Close
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" data-testid="form-review">
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-card border-border rounded-none h-12"
                    data-testid="input-review-name"
                  />
                  <div className="flex items-center gap-1" data-testid="input-review-rating">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        type="button"
                        key={n}
                        onMouseEnter={() => setHoverRating(n)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(n)}
                        aria-label={`${n} star`}
                      >
                        <Star
                          className={cn(
                            "w-6 h-6 transition-colors",
                            n <= (hoverRating || rating) ? "text-primary fill-primary" : "text-muted-foreground"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Tell us about your experience..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    className="bg-card border-border rounded-none resize-y"
                    data-testid="input-review-text"
                  />
                  {error && <p className="text-destructive text-sm">{error}</p>}
                  <div className="flex gap-3">
                    <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none tracking-widest uppercase" data-testid="button-submit-review">
                      Submit Review
                    </Button>
                    <Button type="button" variant="ghost" className="text-muted-foreground hover:text-primary uppercase tracking-widest" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {testimonials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="flex flex-col items-center text-center p-8 border border-border/50 bg-background/50 rounded-sm"
            >
              <div className="flex gap-1 mb-6 text-primary">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p className="text-foreground/90 font-serif italic text-lg md:text-xl leading-relaxed mb-8 flex-grow">
                "{testimonial.text}"
              </p>
              <span className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
                — {testimonial.name}
              </span>
            </motion.div>
          ))}
        </div>
      ) : (
        !showForm && (
          <p className="text-center text-muted-foreground">
            Be the first to share your experience with us.
          </p>
        )
      )}
    </SectionContainer>
  );
}
