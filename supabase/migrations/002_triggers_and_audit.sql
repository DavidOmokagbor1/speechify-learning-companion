-- Drop triggers first so script can be re-run safely
DROP TRIGGER IF EXISTS set_user_id_before_insert ON public.listening_sessions;
DROP TRIGGER IF EXISTS listening_sessions_audit_trigger ON public.listening_sessions;

-- Helper: set user_id from auth.uid() if missing
CREATE OR REPLACE FUNCTION public.set_user_id_from_auth_uid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := (SELECT auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_user_id_before_insert
BEFORE INSERT ON public.listening_sessions
FOR EACH ROW EXECUTE FUNCTION public.set_user_id_from_auth_uid();

-- Audit table
CREATE TABLE IF NOT EXISTS public.listening_sessions_audit (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  action text NOT NULL,
  performed_by uuid,
  performed_by_role text,
  happened_at timestamptz DEFAULT now(),
  old_row jsonb,
  new_row jsonb
);

-- Audit function
CREATE OR REPLACE FUNCTION public.audit_listening_sessions_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.listening_sessions_audit (action, performed_by, performed_by_role, old_row)
    VALUES (TG_OP, (SELECT auth.uid()), (auth.jwt() ->> 'role'), to_jsonb(OLD));
    RETURN OLD;
  ELSE
    INSERT INTO public.listening_sessions_audit (action, performed_by, performed_by_role, old_row, new_row)
    VALUES (TG_OP, (SELECT auth.uid()), (auth.jwt() ->> 'role'), to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER listening_sessions_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.listening_sessions
FOR EACH ROW EXECUTE FUNCTION public.audit_listening_sessions_changes();

-- Restrict execution of helper functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.set_user_id_from_auth_uid() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_listening_sessions_changes() FROM anon, authenticated;
