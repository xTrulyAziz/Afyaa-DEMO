import { createClient } from "@/lib/supabase/client";
import type { ContactContent } from "@/types/database";

export async function upsertContactContent(
  id: string | null,
  payload: Partial<Omit<ContactContent, "id" | "created_at" | "updated_at">>
): Promise<{ data: ContactContent | null; error: string | null }> {
  const supabase = createClient();
  const body = id ? { id, ...payload } : { ...payload };
  const { data, error } = await supabase
    .from("contact_content")
    .upsert(body)
    .select()
    .single();
  return { data: data as ContactContent | null, error: error ? error.message : null };
}
