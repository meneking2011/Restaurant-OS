import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, trendUp, className }: StatCardProps) {
  return (
    <div className={cn("bg-white/5 border border-white/10 rounded-xl p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-foreground/50 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-semibold text-foreground mt-1">{value}</p>
          {trend && (
            <p className={cn("text-xs mt-1", trendUp ? "text-emerald-400" : "text-red-400")}>
              {trend}
            </p>
          )}
        </div>
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
