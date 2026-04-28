import { createClient } from "@/lib/supabase/client";
import type { AboutContent } from "@/types/database";

export async function upsertAboutContent(
  id: string | null,
  payload: Partial<Omit<AboutContent, "id" | "created_at" | "updated_at">>
): Promise<{ data: AboutContent | null; error: string | null }> {
  const supabase = createClient();
  const body = id ? { id, ...payload } : { ...payload };
  const { data, error } = await supabase
    .from("about_content")
    .upsert(body)
    .select()
    .single();
  return { data: data as AboutContent | null, error: error ? error.message : null };
}
