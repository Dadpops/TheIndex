import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getEntitiesByPublisherSlug,
  getPublisherBySlug,
  getPublishersWithCounts,
} from "@/lib/data/repository";
import { PublisherBrowser } from "@/components/library/PublisherBrowser";
import { PublisherLogo } from "@/components/ui/PublisherLogo";

interface PageProps {
  params: Promise<{ publisher: string }>;
}

export async function generateStaticParams() {
  const publishers = await getPublishersWithCounts();
  return publishers.map((p) => ({ publisher: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { publisher: slug } = await params;
  const publisher = await getPublisherBySlug(slug);
  if (!publisher) return { title: "Not found" };
  return {
    title: publisher.name,
    description: `Browse every ${publisher.name} character and team indexed in The Index.`,
  };
}

export default async function PublisherPage({ params }: PageProps) {
  const { publisher: slug } = await params;
  const publisher = await getPublisherBySlug(slug);
  if (!publisher) notFound();

  const entities = await getEntitiesByPublisherSlug(slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <div className="flex items-center gap-4">
          <PublisherLogo publisher={publisher} size={48} className="max-h-12 shrink-0" />
          <h1 className="display text-5xl tracking-wide text-text-primary sm:text-6xl">
            {publisher.name}
          </h1>
        </div>
        <p className="mt-3 max-w-2xl text-text-secondary">
          Every {publisher.name} character and team in the archive — browse, search, and trace their
          full publication history.
        </p>
      </header>

      <PublisherBrowser entities={entities} publisherColor={publisher.color_hex} />
    </div>
  );
}
