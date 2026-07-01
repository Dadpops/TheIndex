import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllEntities, getEntityBySlug, getStartHere } from "@/lib/data/repository";
import { EntityPageView } from "@/components/entity/EntityPageView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const entities = await getAllEntities();
  return entities.filter((e) => e.entity_type === "team").map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entity = await getEntityBySlug(slug);
  if (!entity || entity.entity_type !== "team") return { title: "Not found" };
  return {
    title: entity.name,
    description: entity.short_bio ?? `${entity.name} — full history, roster, reading guide, and media on The Index.`,
  };
}

export default async function TeamPage({ params }: PageProps) {
  const { slug } = await params;
  const entity = await getEntityBySlug(slug);
  if (!entity || entity.entity_type !== "team") notFound();

  const startHere = await getStartHere(entity.id);
  return <EntityPageView entity={entity} startHere={startHere} />;
}
