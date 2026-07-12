import { useState } from "react";
import { cn } from "@/utils/cn";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageComponentProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: "square" | "video" | "auto" | "portrait";
}

export function ImageComponent({ src, alt, className, aspectRatio = "auto", ...props }: ImageComponentProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    auto: "aspect-auto"
  }[aspectRatio];

  return (
    <div className={cn("relative overflow-hidden bg-muted", aspectRatioClass, className)}>
      {!isLoaded && <Skeleton className="absolute inset-0 h-full w-full" />}
      <img
        src={src}
        alt={alt}
        className={cn(
          "object-cover w-full h-full transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  );
}
