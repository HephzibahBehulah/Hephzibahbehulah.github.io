-- Applied to the connected VoltPro project. This internal event trigger
-- must remain active but must not be executable by public API roles.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

