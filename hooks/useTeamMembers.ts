"use client";

import { useQuery } from "@tanstack/react-query";
import type { TeamMemberWithEntity } from "@/types";
import { fetchJson, queryKeys } from "@/lib/query/fetcher";

/** Team roster (members + their eras), for the team Members tab. */
export function useTeamMembers(slug: string) {
  return useQuery({
    queryKey: queryKeys.members(slug),
    queryFn: () => fetchJson<TeamMemberWithEntity[]>(`/api/entities/${slug}/members`),
    enabled: Boolean(slug),
  });
}
