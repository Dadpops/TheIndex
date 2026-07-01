"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/ui/cn";
import { coverArt, halftone, initials } from "@/lib/ui/placeholder";

interface EntityImageProps {
  coverImageUrl: string | null;
  name: string;
  publisherColor?: string | null;
  /** Fixed square size in px (cards/avatars). Omit and use `className` for aspect/fill contexts. */
  size?: number;
  className?: string;
  rounded?: string;
  sizes?: string;
  priority?: boolean;
  /** Show the initials on the fallback tile (off for large hero banners). */
  showInitials?: boolean;
}

/**
 * Entity cover image with a graceful fallback. If `coverImageUrl` is null or the
 * image fails to load, renders a solid publisher-color tile with the entity's
 * initials in white Bebas Neue. Uses `next/image` (fill) inside a sized box.
 */
export function EntityImage({
  coverImageUrl,
  name,
  publisherColor,
  size,
  className,
  rounded,
  sizes = "(max-width: 768px) 50vw, 320px",
  priority = false,
  showInitials = true,
}: EntityImageProps) {
  const [errored, setErrored] = useState(false);
  const showImage = Boolean(coverImageUrl) && !errored;

  return (
    <div
      className={cn("relative overflow-hidden", rounded, className)}
      style={{
        backgroundColor: publisherColor ?? "var(--color-surface-alt)",
        backgroundImage: coverArt(name, publisherColor ?? null),
        containerType: "inline-size",
        ...(size ? { width: size, height: size } : {}),
      }}
    >
      {showImage ? (
        <Image
          src={coverImageUrl as string}
          alt={name}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setErrored(true)}
          className="object-cover"
        />
      ) : (
        <>
          {/* Comic halftone texture over the generated cover. */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-50 mix-blend-overlay"
            style={{ backgroundImage: halftone, backgroundSize: "7px 7px" }}
          />
          {showInitials ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="display select-none font-medium leading-none text-white/95 drop-shadow"
                style={{ fontSize: "38cqi" }}
              >
                {initials(name)}
              </span>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
