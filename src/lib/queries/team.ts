import { createClient } from "@/lib/supabase/client";
import type { TeamMember } from "@/types/database";

export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    if (process.env.NODE_ENV === "development") console.error("[team] getAllTeamMembers:", error);
    return [];
  }
  return (data as TeamMember[]) ?? [];
}

export async function createTeamMember(
  payload: Omit<TeamMember, "id" | "created_at" | "updated_at">
): Promise<{ data: TeamMember | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("team_members")
    .insert(payload)
    .select()
    .single();

  if (error && process.env.NODE_ENV === "development")
    console.error("[team] createTeamMember:", error);

  return { data: data as TeamMember | null, error: error ? error.message : null };
}

export async function updateTeamMember(
  id: string,
  payload: Partial<Omit<TeamMember, "id" | "created_at" | "updated_at">>
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("team_members").update(payload).eq("id", id);

  if (error && process.env.NODE_ENV === "development")
    console.error("[team] updateTeamMember:", error);

  return { error: error ? error.message : null };
}

export async function deleteTeamMember(id: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("team_members").delete().eq("id", id);

  if (error && process.env.NODE_ENV === "development")
    console.error("[team] deleteTeamMember:", error);

  return { error: error ? error.message : null };
}

export async function updateTeamOrder(
  members: { id: string; display_order: number }[]
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const updates = members.map(({ id, display_order }) =>
    supabase.from("team_members").update({ display_order }).eq("id", id)
  );
  const results = await Promise.all(updates);
  const firstError = results.find((r) => r.error);
  return { error: firstError?.error?.message ?? null };
}
