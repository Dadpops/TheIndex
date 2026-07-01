import { entityScopedHandler } from "@/lib/api/entity-route";
import { getMedia } from "@/lib/data/repository";

export const GET = entityScopedHandler(getMedia);
