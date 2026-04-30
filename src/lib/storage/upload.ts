import { createClient } from "@/lib/supabase/client";

export type Bucket = "about" | "projects" | "team" | "partners";

export async function uploadImage(
  file: File,
  bucket: Bucket,
  path: string
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) return { url: null, error: error.message };

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

export async function deleteStorageFile(
  bucket: Bucket,
  path: string
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return { error: error ? error.message : null };
}

export function generateFileName(file: File, prefix = ""): string {
  const ext = file.name.split(".").pop();
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}${timestamp}-${random}.${ext}`;
}
