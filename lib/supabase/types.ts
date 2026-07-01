// =============================================================================
// Supabase generated Database types.
// -----------------------------------------------------------------------------
// In a project with a live Supabase backend, regenerate this file with:
//   npx supabase gen types typescript --project-id <id> > lib/supabase/types.ts
//
// Until then, this hand-written Database type mirrors the migration schema so
// the typed Supabase client (`createClient<Database>()`) stays fully type-safe.
// =============================================================================

import type {
  Arc,
  Entity,
  Era,
  MediaEntry,
  Publisher,
  ReadingEntry,
  Relationship,
  StartHere,
  TeamMember,
} from "@/types";

type Insert<T> = Omit<T, "id" | "created_at"> & { id?: string; created_at?: string };
type Update<T> = Partial<Insert<T>>;

interface TableShape<Row> {
  Row: Row;
  Insert: Insert<Row>;
  Update: Update<Row>;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      publishers: TableShape<Publisher>;
      entities: TableShape<Entity>;
      eras: TableShape<Era>;
      arcs: TableShape<Arc>;
      reading_entries: TableShape<ReadingEntry>;
      start_here: TableShape<StartHere>;
      relationships: TableShape<Relationship>;
      media_entries: TableShape<MediaEntry>;
      team_members: TableShape<TeamMember>;
    };
    // Empty-object idiom (NOT Record<string, never>, which would claim every
    // key maps to never and break the GenericSchema constraint).
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
