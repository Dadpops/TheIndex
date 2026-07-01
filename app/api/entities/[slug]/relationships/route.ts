import { entityScopedHandler } from "@/lib/api/entity-route";
import { getRelationships } from "@/lib/data/repository";

export const GET = entityScopedHandler(getRelationships);
