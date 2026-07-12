import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRestaurantStore } from "@/store/restaurantStore";
import { Service } from "@/types/restaurant";
import { AdminLayout } from "../layout/AdminLayout";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Plus, Pencil, Trash2, X, Check, ConciergeBell } from "lucide-react";

const serviceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.string().min(1, "Icon is required"),
});

type ServiceForm = z.infer<typeof serviceSchema>;

function ServiceFormFields({
  defaultValues,
  onSubmit,
  onCancel,
}: {
  defaultValues?: Partial<ServiceForm>;
  onSubmit: (data: ServiceForm) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues,
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-foreground/60 mb-1 block">Title</label>
          <input
            {...register("title")}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
            placeholder="Service title"
          />
          {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="text-xs text-foreground/60 mb-1 block">Icon (name)</label>
          <input
            {...register("icon")}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
            placeholder="e.g. leaf, bell, glass"
          />
          {errors.icon && <p className="text-red-400 text-xs mt-1">{errors.icon.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-foreground/60 mb-1 block">Description</label>
          <textarea
            {...register("description")}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none"
            placeholder="Describe this service offering"
          />
          {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
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

export default function AdminServices() {
  const { services, addService, updateService, deleteService } = useRestaurantStore();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  return (
    <AdminLayout
      title="Services"
      subtitle={`${services.length} service offerings`}
      actions={
        <button
          onClick={() => { setAdding(true); setEditingId(null); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Service
        </button>
      }
    >
      {adding && (
        <div className="mb-4">
          <ServiceFormFields
            onSubmit={(data) => { addService(data); setAdding(false); }}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      <div className="space-y-3">
        {services.map((svc) =>
          editingId === svc.id ? (
            <ServiceFormFields
              key={svc.id}
              defaultValues={svc}
              onSubmit={(data) => { updateService(svc.id, data); setEditingId(null); }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={svc.id}
              className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl p-5 group"
            >
              <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
                <ConciergeBell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{svc.title}</p>
                <p className="text-sm text-foreground/60 mt-1 leading-relaxed">{svc.description}</p>
                <p className="text-xs text-foreground/30 mt-2">icon: {svc.icon}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => { setEditingId(svc.id); setAdding(false); }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-foreground/50 hover:text-foreground transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTarget(svc.id)}
                  className="p-1.5 rounded-lg hover:bg-red-400/10 text-foreground/50 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete service?"
        description="This will permanently remove this service offering."
        onConfirm={() => {
          if (deleteTarget) deleteService(deleteTarget);
          setDeleteTarget(null);
        }}
      />
    </AdminLayout>
  );
}
