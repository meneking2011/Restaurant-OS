import { SectionContainer } from "@/components/ui/SectionContainer";
import { ImageComponent } from "@/components/ui/ImageComponent";

const galleryImages = [
  "https://picsum.photos/seed/g1/800/800",
  "https://picsum.photos/seed/g2/800/600",
  "https://picsum.photos/seed/g3/800/600",
  "https://picsum.photos/seed/g4/800/800",
  "https://picsum.photos/seed/g5/800/600",
  "https://picsum.photos/seed/g6/800/600",
];

export function GalleryGrid() {
  return (
    <SectionContainer>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {galleryImages.map((src, idx) => (
          <div 
            key={idx} 
            className={`overflow-hidden rounded-sm ${idx === 0 || idx === 3 ? "row-span-2" : ""}`}
          >
            <ImageComponent 
              src={src} 
              alt={`Gallery image ${idx + 1}`} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
              aspectRatio={idx === 0 || idx === 3 ? "portrait" : "square"}
            />
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
