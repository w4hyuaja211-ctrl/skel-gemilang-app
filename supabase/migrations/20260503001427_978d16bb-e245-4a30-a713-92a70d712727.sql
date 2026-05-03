
-- Restrict logo bucket listing: keep public read of objects already allowed by policy on storage.objects,
-- but make bucket itself non-public so anonymous cannot list bucket index.
UPDATE storage.buckets SET public = false WHERE id = 'school-logos';

-- Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
