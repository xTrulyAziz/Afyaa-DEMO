/**
 * Server-side helper: returns true if the current session user
 * has profiles.role = 'admin'.
 *
 * Uses the regular server client (anon key + cookies) so it respects
 * the logged-in session, not the service role.
 */
import { createClient } from "@/lib/supabase/server";

export async function getIsAdmin(): Promise<{ isAdmin: boolean; email: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { isAdmin: false, email: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return {
    isAdmin: profile?.role === "admin",
    email: user.email ?? null,
  };
}
