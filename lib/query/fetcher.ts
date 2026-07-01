/** Typed JSON fetcher used by all TanStack Query hooks. */
export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      // non-JSON error body — keep the status message
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

/** Centralized query keys so cache invalidation stays consistent. */
export const queryKeys = {
  entity: (slug: string) => ["entity", slug] as const,
  startHere: (slug: string) => ["start-here", slug] as const,
  timeline: (slug: string) => ["timeline", slug] as const,
  relationships: (slug: string) => ["relationships", slug] as const,
  media: (slug: string) => ["media", slug] as const,
  bibliography: (slug: string) => ["bibliography", slug] as const,
  members: (slug: string) => ["members", slug] as const,
  publisherEntities: (slug: string) => ["publisher-entities", slug] as const,
  searchIndex: () => ["search-index"] as const,
};
