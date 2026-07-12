import { cn } from "@/utils/cn";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center items-center", className)}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary border-t-transparent border-l-transparent border-r-transparent"></div>
    </div>
  );
}
