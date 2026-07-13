import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRestaurantStore } from "@/store/restaurantStore";
import { AdminLayout } from "../layout/AdminLayout";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Star, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  text: z.string().min(10, "Review must be at least 10 characters"),
  rating: z.coerce.number().min(1).max(5),
  date: z.string().min(1, "Date is required"),
});

type TestimonialForm = z.infer<typeof testimonialSchema>;

function TestimonialFormFields({
  defaultValues,
  onSubmit,
  onCancel,
}: {
  defaultValues?: Partial<TestimonialForm>;
  onSubmit: (data: TestimonialForm) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TestimonialForm>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: { rating: 5, ...defaultValues },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-foreground/60 mb-1 block">Guest Name</label>
          <input
            {...register("name")}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
            placeholder="Eleanor V."
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="text-xs text-foreground/60 mb-1 block">Rating (1–5)</label>
          <input
            {...register("rating")}
            type="number"
            min={1}
            max={5}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
          />
          {errors.rating && <p className="text-red-400 text-xs mt-1">{errors.rating.message}</p>}
        </div>
        <div>
          <label className="text-xs text-foreground/60 mb-1 block">Date</label>
          <input
            {...register("date")}
            type="date"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
          />
          {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-foreground/60 mb-1 block">Review Text</label>
          <textarea
            {...register("text")}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none"
            placeholder="Share the guest's experience..."
          />
          {errors.text && <p className="text-red-400 text-xs mt-1">{errors.text.message}</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors">
          <Check className="w-3.5 h-3.5" /> Save
        </button>
        <button type="button" onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2 bg-white/5 text-foreground/70 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
      </div>
    </form>
  );
}

export default function AdminTestimonials() {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useRestaurantStore();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  return (
    <AdminLayout
      title="Testimonials"
      subtitle={`${testimonials.length} guest reviews`}
      actions={
        <button
          onClick={() => { setAdding(true); setEditingId(null); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Review
        </button>
      }
    >
      {adding && (
        <div className="mb-4">
          <TestimonialFormFields
            onSubmit={(data) => { addTestimonial(data); setAdding(false); }}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      <div className="space-y-3">
        {testimonials.map((t) =>
          editingId === t.id ? (
            <TestimonialFormFields
              key={t.id}
              defaultValues={t}
              onSubmit={(data) => { updateTestimonial(t.id, data); setEditingId(null); }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-5 group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <span className="text-xs text-foreground/40">{t.date}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-3.5 h-3.5",
                          i < t.rating ? "text-primary fill-primary" : "text-foreground/20"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/70 leading-relaxed italic">"{t.text}"</p>
                </div>
                <div className="flex gap-1 ml-4">
                  <button
                    onClick={() => { setEditingId(t.id); setAdding(false); }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-foreground/50 hover:text-foreground transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(t.id)}
                    className="p-1.5 rounded-lg hover:bg-red-400/10 text-foreground/50 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete testimonial?"
        description="This review will be permanently removed from the website."
        onConfirm={() => {
          if (deleteTarget) deleteTestimonial(deleteTarget);
          setDeleteTarget(null);
        }}
      />
    </AdminLayout>
  );
}
