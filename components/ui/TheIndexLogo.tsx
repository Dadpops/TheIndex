interface TheIndexLogoProps {
  className?: string;
  /** Accent underline color. Defaults to the signature ink yellow. */
  accent?: string;
}

/**
 * The Index wordmark — a pure typographic mark in Bebas Neue: a small "THE"
 * stacked above a full-size "INDEX", with a thin accent line spanning exactly
 * the width of "INDEX" (forced via `textLength` so the rule always matches the
 * word). No icon, no graphic.
 */
export function TheIndexLogo({ className, accent = "#E8C840" }: TheIndexLogoProps) {
  const fontFamily = "var(--font-bebas-neue), 'Arial Narrow', sans-serif";
  return (
    <svg
      viewBox="0 0 210 92"
      className={className}
      role="img"
      aria-label="The Index"
      fill="currentColor"
    >
      <text
        x="4"
        y="26"
        fontFamily={fontFamily}
        fontSize="22"
        letterSpacing="6"
        textLength="80"
        lengthAdjust="spacingAndGlyphs"
      >
        THE
      </text>
      <text
        x="4"
        y="78"
        fontFamily={fontFamily}
        fontSize="62"
        letterSpacing="1"
        textLength="202"
        lengthAdjust="spacingAndGlyphs"
      >
        INDEX
      </text>
      {/* Accent rule, full width of "INDEX" only. */}
      <rect x="4" y="84" width="202" height="5" fill={accent} />
    </svg>
  );
}
