CREATE OR REPLACE FUNCTION get_user_team_id(target_user_id integer)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT team_id
  FROM team_members
  WHERE user_id = target_user_id
  ORDER BY joined_at
  LIMIT 1;
$$;
