-- Fix infinite recursion in profiles RLS policy
DROP POLICY IF EXISTS "Users with sharing can read other profiles" ON profiles;

CREATE OR REPLACE FUNCTION public.current_user_has_sharing_enabled()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT sharing_enabled FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

CREATE POLICY "Users with sharing can read other profiles"
  ON profiles FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid()) = id
    OR public.current_user_has_sharing_enabled()
  );
