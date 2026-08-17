REVOKE ALL ON FUNCTION public.ensure_setup(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.ensure_setup(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.ensure_setup(text) TO authenticated;