import { getEntitiesByPublisherSlug, getPublisherBySlug } from "@/lib/data/repository";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await ctx.params;
  const publisher = await getPublisherBySlug(slug);
  if (!publisher) {
    return Response.json({ error: "Publisher not found" }, { status: 404 });
  }
  const entities = await getEntitiesByPublisherSlug(slug);
  return Response.json({ publisher, entities });
}
