import { createClient } from "@/lib/supabase/client";
import type { Project, ProjectImage } from "@/types/database";

function devLog(fn: string, error: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[projects] ${fn}:`, error);
  }
}

export async function getAllProjects(): Promise<Project[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, project_images(*)")
    .order("display_order", { ascending: true });

  if (error) { devLog("getAllProjects", error); return []; }
  return (data as Project[]) ?? [];
}

export async function createProject(
  payload: Omit<Project, "id" | "created_at" | "updated_at" | "project_images">
): Promise<{ data: Project | null; error: string | null }> {
  const supabase = createClient();

  // Verify session first
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const msg = "لا توجد جلسة تسجيل دخول. يرجى تسجيل الدخول مجدداً.";
    devLog("createProject – no session", msg);
    return { data: null, error: msg };
  }

  const { data, error } = await supabase
    .from("projects")
    .insert(payload)
    .select()
    .single();

  if (error) {
    devLog("createProject", error);
    return { data: null, error: error.message };
  }
  return { data: data as Project, error: null };
}

export async function updateProject(
  id: string,
  payload: Partial<Omit<Project, "id" | "created_at" | "updated_at" | "project_images">>
): Promise<{ error: string | null }> {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const msg = "لا توجد جلسة تسجيل دخول. يرجى تسجيل الدخول مجدداً.";
    devLog("updateProject – no session", msg);
    return { error: msg };
  }

  const { error } = await supabase.from("projects").update(payload).eq("id", id);
  if (error) { devLog("updateProject", error); return { error: error.message }; }
  return { error: null };
}

export async function deleteProject(id: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) { devLog("deleteProject", error); return { error: error.message }; }
  return { error: null };
}

export async function addProjectImage(
  projectId: string,
  imageUrl: string,
  displayOrder: number
): Promise<{ data: ProjectImage | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("project_images")
    .insert({ project_id: projectId, image_url: imageUrl, display_order: displayOrder })
    .select()
    .single();

  if (error) { devLog("addProjectImage", error); return { data: null, error: error.message }; }
  return { data: data as ProjectImage, error: null };
}

export async function deleteProjectImage(imageId: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("project_images").delete().eq("id", imageId);
  if (error) { devLog("deleteProjectImage", error); return { error: error.message }; }
  return { error: null };
}

export async function updateProjectOrder(
  projects: { id: string; display_order: number }[]
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const updates = projects.map(({ id, display_order }) =>
    supabase.from("projects").update({ display_order }).eq("id", id)
  );
  const results = await Promise.all(updates);
  const firstError = results.find((r) => r.error);
  if (firstError?.error) { devLog("updateProjectOrder", firstError.error); }
  return { error: firstError?.error?.message ?? null };
}
