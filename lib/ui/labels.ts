import type { ArcType, MediaType, ReadingFormat, TeamRole } from "@/types";

export const ARC_TYPE_LABELS: Record<ArcType, string> = {
  origin: "Origin",
  flagship: "Flagship",
  crossover: "Crossover",
  elseworlds: "Elseworlds",
  annual: "Annual",
  miniseries: "Miniseries",
  "tie-in": "Tie-in",
  retcon: "Retcon",
};

export const FORMAT_LABELS: Record<ReadingFormat, string> = {
  omnibus: "Omnibus",
  hardcover: "Hardcover",
  trade: "Trade",
  digital: "Digital",
  single_issues: "Single Issues",
};

/** Reading entries group omnibus-first, then hardcovers, trades, digital, singles. */
export const FORMAT_ORDER: ReadingFormat[] = [
  "omnibus",
  "hardcover",
  "trade",
  "digital",
  "single_issues",
];

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  animated_series: "Animated Series",
  live_action: "Live Action",
  film: "Films",
  video_game: "Video Games",
  podcast: "Podcasts",
  audio_drama: "Audio Dramas",
};

/** Display order of media groups on the Media tab. */
export const MEDIA_TYPE_ORDER: MediaType[] = [
  "animated_series",
  "live_action",
  "film",
  "video_game",
  "podcast",
  "audio_drama",
];

export const ROLE_LABELS: Record<TeamRole, string> = {
  founder: "Founder",
  leader: "Leader",
  member: "Member",
  honorary: "Honorary",
};

export function formatLabel(format: ReadingFormat): string {
  return FORMAT_LABELS[format] ?? format;
}

export function arcTypeLabel(type: ArcType): string {
  return ARC_TYPE_LABELS[type] ?? type;
}

/** Format a year range like "1986–1987", "1986", or "1986–present". */
export function yearRange(start: number | null, end: number | null): string {
  if (start && end) return start === end ? `${start}` : `${start}–${end}`;
  if (start && !end) return `${start}–present`;
  if (!start && end) return `${end}`;
  return "";
}
