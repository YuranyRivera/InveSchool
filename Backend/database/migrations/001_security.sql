-- Endurecimiento de seguridad de la base de datos (Supabase).
-- Es idempotente: se puede ejecutar más de una vez sin efectos secundarios.

-- 1) La app NO usa la API pública de Supabase (PostgREST). El backend se conecta como "postgres",
--    así que los roles públicos "anon" y "authenticated" no necesitan ningún permiso.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

-- Las tablas que se creen en el futuro tampoco quedarán expuestas.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;

-- 2) Bitácora de auditoría: quién hizo qué, cuándo y desde dónde.
CREATE TABLE IF NOT EXISTS public.audit_log (
    id          BIGSERIAL PRIMARY KEY,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    action      VARCHAR(40)  NOT NULL,          -- login_ok, login_fail, create, update, delete...
    user_id     INTEGER,
    user_name   VARCHAR(100),
    user_role   VARCHAR(40),
    email       VARCHAR(254),                   -- correo usado en intentos de login
    method      VARCHAR(10),
    path        VARCHAR(300),
    status      INTEGER,
    ip          VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON public.audit_log (created_at DESC);

-- Deny-all para cualquier acceso que no sea el backend.
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.audit_log FROM anon, authenticated;

-- 3) Asegura RLS en todas las tablas de la app (sin políticas = nadie externo puede leer ni escribir).
DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;
