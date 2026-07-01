import { entityScopedHandler } from "@/lib/api/entity-route";
import { getStartHere } from "@/lib/data/repository";

export const GET = entityScopedHandler(getStartHere);
