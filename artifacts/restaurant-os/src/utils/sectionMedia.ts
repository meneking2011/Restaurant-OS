import { SectionMediaConfig } from "@/types/restaurant";
import { CSSProperties } from "react";

/** Computes a background style + whether an overlay should render for a section's media config. */
export function sectionBackgroundStyle(media: SectionMediaConfig): CSSProperties {
  if (media.useBackgroundColor && media.backgroundColor) {
    return { backgroundColor: media.backgroundColor };
  }
  if (media.backgroundImage) {
    return {
      backgroundImage: `url(${media.backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return {};
}

export function hasSectionOverlay(media: SectionMediaConfig) {
  return Boolean(media.backgroundImage) && !media.useBackgroundColor && media.overlayOpacity > 0;
}
