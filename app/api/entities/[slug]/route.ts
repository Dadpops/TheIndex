import { getEntityBySlug } from "@/lib/data/repository";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await ctx.params;
  const entity = await getEntityBySlug(slug);
  if (!entity) {
    return Response.json({ error: "Entity not found" }, { status: 404 });
  }
  return Response.json(entity);
}
