import { createClient } from "@/lib/supabase/client";
import type { Partner } from "@/types/database";

export async function getAllPartners(): Promise<Partner[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    if (process.env.NODE_ENV === "development") console.error("[partners] getAllPartners:", error);
    return [];
  }
  return (data as Partner[]) ?? [];
}

export async function createPartner(
  payload: Omit<Partner, "id" | "created_at" | "updated_at">
): Promise<{ data: Partner | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("partners")
    .insert(payload)
    .select()
    .single();

  if (error && process.env.NODE_ENV === "development")
    console.error("[partners] createPartner:", error);

  return { data: data as Partner | null, error: error ? error.message : null };
}

export async function updatePartner(
  id: string,
  payload: Partial<Omit<Partner, "id" | "created_at" | "updated_at">>
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("partners").update(payload).eq("id", id);

  if (error && process.env.NODE_ENV === "development")
    console.error("[partners] updatePartner:", error);

  return { error: error ? error.message : null };
}

export async function deletePartner(id: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("partners").delete().eq("id", id);

  if (error && process.env.NODE_ENV === "development")
    console.error("[partners] deletePartner:", error);

  return { error: error ? error.message : null };
}

export async function updatePartnersOrder(
  partners: { id: string; display_order: number }[]
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const updates = partners.map(({ id, display_order }) =>
    supabase.from("partners").update({ display_order }).eq("id", id)
  );
  const results = await Promise.all(updates);
  const firstError = results.find((r) => r.error);
  return { error: firstError?.error?.message ?? null };
}
