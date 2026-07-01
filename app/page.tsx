import { getPublishersWithCounts } from "@/lib/data/repository";
import { PublisherGrid } from "@/components/library/PublisherGrid";
import { HomeSearch } from "@/components/library/HomeSearch";
import { TheIndexLogo } from "@/components/ui/TheIndexLogo";

export default async function HomePage() {
  const publishers = await getPublishersWithCounts();
  const totalCharacters = publishers.reduce((n, p) => n + p.character_count, 0);
  const totalTeams = publishers.reduce((n, p) => n + p.team_count, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 pb-12 pt-16 text-center sm:pt-24">
        <TheIndexLogo className="h-24 w-auto text-text-primary sm:h-28" />
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-text-secondary">
          The comic reference archive
        </p>
        <h1 className="display max-w-3xl text-6xl leading-[0.9] tracking-wide text-text-primary sm:text-8xl">
          Every character.
          <br />
          Every era. Every arc.
        </h1>
        <p className="max-w-xl text-balance text-text-secondary">
          A one-stop reference for getting into comics, returning after time away, or exploring a
          specific era. Find any character or team, trace their full history, and know exactly how to
          read, watch, or listen.
        </p>
        <div className="mt-2 w-full">
          <HomeSearch />
        </div>
        <p className="font-mono text-xs text-text-secondary/70 tabular">
          {totalCharacters} characters · {totalTeams} teams · {publishers.length} publishers indexed
        </p>
      </section>

      {/* Publisher entry points */}
      <section className="pb-24">
        <PublisherGrid publishers={publishers} />
      </section>
    </div>
  );
}
