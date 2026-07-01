import type { Publisher } from "@/types";
import { cn } from "@/lib/ui/cn";

interface PublisherLogoProps {
  publisher: Pick<Publisher, "name" | "color_hex" | "logo_url">;
  /** Chip height in px. The logo scales to fit within it. */
  size?: number;
  className?: string;
}

/**
 * Renders a publisher's logo from `logo_url` inside a white chip so any logo —
 * including dark-on-transparent marks — stays legible on the dark UI. Falls back
 * to a publisher-color dot when no logo exists. Logos are small static assets,
 * so a plain <img> is used (no next/image SVG config needed).
 */
export function PublisherLogo({ publisher, size = 32, className }: PublisherLogoProps) {
  if (publisher.logo_url) {
    const pad = Math.max(3, Math.round(size * 0.14));
    return (
      <span
        className={cn("inline-flex items-center justify-center rounded-md bg-white", className)}
        style={{ height: size, padding: pad }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={publisher.logo_url}
          alt={`${publisher.name} logo`}
          className="object-contain"
          style={{ maxHeight: size - pad * 2, width: "auto", maxWidth: size * 3 }}
        />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0 rounded-full", className)}
      style={{ width: size, height: size, backgroundColor: publisher.color_hex ?? "var(--color-border)" }}
    />
  );
}
