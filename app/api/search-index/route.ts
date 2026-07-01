import { getSearchIndex } from "@/lib/data/repository";

/**
 * Returns the full, lightweight search index. Fuse.js runs client-side over
 * this payload; the index is small (names + bios), so one fetch per session is
 * cheap and enables instant fuzzy search across the whole library.
 */
export async function GET(): Promise<Response> {
  const records = await getSearchIndex();
  return Response.json(records, {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" },
  });
}
