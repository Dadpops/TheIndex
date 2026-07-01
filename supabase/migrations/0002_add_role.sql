-- =============================================================================
-- The Index — add entity role (hero / villain / antihero / neutral)
-- -----------------------------------------------------------------------------
-- Idempotent: safe to run on databases created from an earlier 0001_init.sql
-- that predates the role column.
-- =============================================================================

alter table entities
  add column if not exists role text not null default 'hero';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'entities_role_check'
  ) then
    alter table entities
      add constraint entities_role_check
      check (role in ('hero','villain','antihero','neutral'));
  end if;
end $$;

create index if not exists entities_role_idx on entities(role);
