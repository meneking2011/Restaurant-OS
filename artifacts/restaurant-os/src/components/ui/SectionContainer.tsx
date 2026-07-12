import { cn } from "@/utils/cn";

interface SectionContainerProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export function SectionContainer({ children, className, containerClassName, ...props }: SectionContainerProps) {
  return (
    <section className={cn("py-16 md:py-24", className)} {...props}>
      <div className={cn("container mx-auto px-4 md:px-8 max-w-7xl", containerClassName)}>
        {children}
      </div>
    </section>
  );
}
