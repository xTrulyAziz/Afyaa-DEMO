import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";
import type { Project } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, project_images(*)")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  return <ProjectForm mode="edit" project={data as Project} />;
}
