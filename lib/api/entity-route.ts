import "server-only";

import { getEntityBySlug } from "@/lib/data/repository";

/**
 * Factory for entity-scoped GET route handlers. Resolves the `[slug]` segment
 * to an entity, 404s if missing, then runs the repository function by id.
 */
export function entityScopedHandler<T>(fn: (entityId: string) => Promise<T>) {
  return async function GET(
    _req: Request,
    ctx: { params: Promise<{ slug: string }> },
  ): Promise<Response> {
    const { slug } = await ctx.params;
    const entity = await getEntityBySlug(slug);
    if (!entity) {
      return Response.json({ error: "Entity not found" }, { status: 404 });
    }
    const data = await fn(entity.id);
    return Response.json(data);
  };
}
