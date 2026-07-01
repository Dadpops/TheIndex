"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import type { EntityType, EntityWithPublisher } from "@/types";
import { EntityCard } from "@/components/library/EntityCard";
import { EntitySearch } from "@/components/library/EntitySearch";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import { EmptyState } from "@/components/ui/states";
import { entitySearchOptions } from "@/lib/search/fuseConfig";
import { cn } from "@/lib/ui/cn";
import {
  ENTITY_SORT_LABELS,
  useEntityFilter,
  type EntitySortKey,
  type RoleFilter,
} from "@/hooks/useEntityFilter";

interface PublisherBrowserProps {
  entities: EntityWithPublisher[];
  publisherColor: string | null;
}

const ROLE_PILLS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "hero", label: "Heroes" },
  { value: "villain", label: "Villains" },
  { value: "antihero", label: "Antiheroes" },
];

/** Interactive grid for a publisher page: role filter, sort, and scoped search. */
export function PublisherBrowser({ entities, publisherColor }: PublisherBrowserProps) {
  const characters = useMemo(() => entities.filter((e) => e.entity_type === "character"), [entities]);
  const teams = useMemo(() => entities.filter((e) => e.entity_type === "team"), [entities]);
  const hasTeams = teams.length > 0;

  const [tab, setTab] = useState<EntityType>("character");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [sort, setSort] = useState<EntitySortKey>("name_asc");

  // Characters: role filter + sort compose, then optional fuzzy search.
  const filteredChars = useEntityFilter(characters, role, sort);
  const charFuse = useMemo(() => new Fuse(filteredChars, entitySearchOptions), [filteredChars]);
  const visibleChars = useMemo(() => {
    const q = query.trim();
    return q.length >= 2 ? charFuse.search(q).map((r) => r.item) : filteredChars;
  }, [query, charFuse, filteredChars]);

  // Teams: no role filtering — just name sort + scoped search.
  const sortedTeams = useMemo(() => [...teams].sort((a, b) => a.name.localeCompare(b.name)), [teams]);
  const teamFuse = useMemo(() => new Fuse(sortedTeams, entitySearchOptions), [sortedTeams]);
  const visibleTeams = useMemo(() => {
    const q = query.trim();
    return q.length >= 2 ? teamFuse.search(q).map((r) => r.item) : sortedTeams;
  }, [query, teamFuse, sortedTeams]);

  const showingTeams = hasTeams && tab === "team";

  return (
    <div>
      {/* Characters / Teams toggle — only when this publisher has teams. */}
      {hasTeams ? (
        <div className="mb-6">
          <SegmentedToggle<EntityType>
            aria-label="Entity type"
            value={tab}
            onChange={(v) => {
              setTab(v);
              setQuery("");
            }}
            options={[
              { value: "character", label: "Characters", count: characters.length },
              { value: "team", label: "Teams", count: teams.length },
            ]}
          />
        </div>
      ) : null}

      {showingTeams ? (
        <TeamsSection
          teams={visibleTeams}
          total={teams.length}
          query={query}
          onQuery={setQuery}
        />
      ) : (
        <CharactersSection
          visible={visibleChars}
          total={characters.length}
          role={role}
          onRole={setRole}
          sort={sort}
          onSort={setSort}
          query={query}
          onQuery={setQuery}
          publisherColor={publisherColor}
        />
      )}
    </div>
  );
}

function CharactersSection({
  visible,
  total,
  role,
  onRole,
  sort,
  onSort,
  query,
  onQuery,
  publisherColor,
}: {
  visible: EntityWithPublisher[];
  total: number;
  role: RoleFilter;
  onRole: (r: RoleFilter) => void;
  sort: EntitySortKey;
  onSort: (s: EntitySortKey) => void;
  query: string;
  onQuery: (q: string) => void;
  publisherColor: string | null;
}) {
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {ROLE_PILLS.map((pill) => {
            const active = pill.value === role;
            return (
              <button
                key={pill.value}
                onClick={() => onRole(pill.value)}
                aria-pressed={active}
                style={active && publisherColor ? { backgroundColor: publisherColor } : undefined}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-150",
                  active
                    ? "text-white"
                    : "bg-surface-alt text-text-secondary hover:text-text-primary",
                )}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <span className="hidden sm:inline">Sort</span>
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value as EntitySortKey)}
            className="rounded-md border border-border bg-surface px-2.5 py-2 text-sm text-text-primary focus:border-text-secondary/60 focus:outline-none"
          >
            {(Object.keys(ENTITY_SORT_LABELS) as EntitySortKey[]).map((key) => (
              <option key={key} value={key}>
                {ENTITY_SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs text-text-secondary tabular">
          Showing {visible.length} of {total} {total === 1 ? "Character" : "Characters"}
        </p>
        <div className="w-full sm:w-64">
          <EntitySearch value={query} onChange={onQuery} placeholder="Search characters…" />
        </div>
      </div>

      {visible.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((entity, i) => (
            <EntityCard key={entity.id} entity={entity} priority={i < 6} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={query.trim() ? `No characters match “${query.trim()}”.` : "No characters in this filter."}
          hint={query.trim() ? "Try a different name." : "Try a different role filter."}
        />
      )}
    </div>
  );
}

function TeamsSection({
  teams,
  total,
  query,
  onQuery,
}: {
  teams: EntityWithPublisher[];
  total: number;
  query: string;
  onQuery: (q: string) => void;
}) {
  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs text-text-secondary tabular">
          Showing {teams.length} of {total} {total === 1 ? "Team" : "Teams"}
        </p>
        <div className="w-full sm:w-64">
          <EntitySearch value={query} onChange={onQuery} placeholder="Search teams…" />
        </div>
      </div>

      {teams.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((entity, i) => (
            <EntityCard key={entity.id} entity={entity} priority={i < 6} />
          ))}
        </div>
      ) : (
        <EmptyState title={query.trim() ? `No teams match “${query.trim()}”.` : "No teams yet."} />
      )}
    </div>
  );
}
