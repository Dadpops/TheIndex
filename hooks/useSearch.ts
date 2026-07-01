"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Fuse from "fuse.js";
import type { SearchRecord } from "@/types";
import { fetchJson, queryKeys } from "@/lib/query/fetcher";
import { globalSearchOptions } from "@/lib/search/fuseConfig";

/** Loads the global search index once per session. */
export function useSearchIndex() {
  return useQuery({
    queryKey: queryKeys.searchIndex(),
    queryFn: () => fetchJson<SearchRecord[]>("/api/search-index"),
    staleTime: 30 * 60 * 1000,
  });
}

export interface GroupedSearchResults {
  ordered: SearchRecord[]; // characters (by relevance) then teams — also the keyboard-nav order
  characters: SearchRecord[];
  teams: SearchRecord[];
  isLoading: boolean;
}

/**
 * Global fuzzy search. Builds the Fuse index once the data arrives and returns
 * results grouped Characters-first, then Teams.
 */
export function useSearch(query: string): GroupedSearchResults {
  const { data, isLoading } = useSearchIndex();

  const fuse = useMemo(
    () => (data ? new Fuse(data, globalSearchOptions) : null),
    [data],
  );

  return useMemo(() => {
    const trimmed = query.trim();
    if (!fuse || trimmed.length < 2) {
      return { ordered: [], characters: [], teams: [], isLoading };
    }
    const hits = fuse.search(trimmed).map((r) => r.item);
    const characters = hits.filter((h) => h.entity_type === "character");
    const teams = hits.filter((h) => h.entity_type === "team");
    return { ordered: [...characters, ...teams], characters, teams, isLoading };
  }, [fuse, query, isLoading]);
}
