import { entityScopedHandler } from "@/lib/api/entity-route";
import { getTimeline } from "@/lib/data/repository";

export const GET = entityScopedHandler(getTimeline);
