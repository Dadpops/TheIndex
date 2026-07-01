import type { Metadata } from "next";
import { GlobalSearch } from "@/components/search/GlobalSearch";

export const metadata: Metadata = {
  title: "Search",
  description: "Search every character and team in The Index.",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="display mb-6 text-4xl tracking-wide text-text-primary sm:text-5xl">Search</h1>
      <GlobalSearch initialQuery={q ?? ""} />
    </div>
  );
}
