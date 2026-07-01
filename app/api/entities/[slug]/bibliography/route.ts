import { entityScopedHandler } from "@/lib/api/entity-route";
import { getBibliography } from "@/lib/data/repository";

export const GET = entityScopedHandler(getBibliography);
