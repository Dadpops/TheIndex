import { entityScopedHandler } from "@/lib/api/entity-route";
import { getTeamMembers } from "@/lib/data/repository";

export const GET = entityScopedHandler(getTeamMembers);
