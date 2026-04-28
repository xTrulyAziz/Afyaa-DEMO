import { createClient } from "@/lib/supabase/client";
import type { VisionContent } from "@/types/database";

export async function upsertVisionContent(
  id: string | null,
  payload: Partial<Omit<VisionContent, "id" | "created_at" | "updated_at">>
): Promise<{ data: VisionContent | null; error: string | null }> {
  const supabase = createClient();
  const body = id ? { id, ...payload } : { ...payload };
  const { data, error } = await supabase
    .from("vision_content")
    .upsert(body)
    .select()
    .single();
  return { data: data as VisionContent | null, error: error ? error.message : null };
}
