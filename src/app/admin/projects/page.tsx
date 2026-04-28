"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  deleteProject,
  updateProject,
  updateProjectOrder,
} from "@/lib/queries/projects";
import Toast, { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { Project } from "@/types/database";

export default function AdminProjectsPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("display_order", { ascending: true });
    setProjects((data as Project[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleTogglePublish = async (project: Project) => {
    const { error } = await updateProject(project.id, {
      is_published: !project.is_published,
    });
    if (error) {
      showToast("فشل تغيير حالة النشر", "error");
    } else {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id ? { ...p, is_published: !p.is_published } : p
        )
      );
      showToast(
        project.is_published ? "تم إخفاء المشروع" : "تم نشر المشروع",
        "success"
      );
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await deleteProject(id);
    if (error) {
      showToast("فشل حذف المشروع: " + error, "error");
    } else {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      showToast("تم حذف المشروع بنجاح", "success");
    }
    setDeletingId(null);
    setConfirmDelete(null);
  };

  const handleReorder = async (fromIdx: number, direction: "up" | "down") => {
    const toIdx = direction === "up" ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= projects.length) return;

    const newProjects = [...projects];
    [newProjects[fromIdx], newProjects[toIdx]] = [
      newProjects[toIdx],
      newProjects[fromIdx],
    ];
    const updated = newProjects.map((p, i) => ({ ...p, display_order: i }));
    setProjects(updated);

    await updateProjectOrder(
      updated.map((p) => ({ id: p.id, display_order: p.display_order }))
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <FolderOpen size={22} style={{ color: "var(--primary)" }} />
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary-dark)" }}>
              المشاريع
            </h1>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {projects.filter((p) => p.is_published).length} منشور من أصل {projects.length}
            </p>
          </div>
        </div>
        <Link
          href="/admin/projects/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.65rem 1.5rem",
            borderRadius: "0.6rem",
            background: "var(--primary)",
            color: "white",
            textDecoration: "none",
            fontSize: "0.9rem",
            fontWeight: 700,
          }}
        >
          <Plus size={16} />
          إضافة مشروع
        </Link>
      </div>

      {projects.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "5rem 2rem",
            background: "var(--surface)",
            borderRadius: "1rem",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
        >
          <FolderOpen size={52} style={{ margin: "0 auto 1rem", color: "var(--border)", display: "block" }} />
          <p>لا توجد مشاريع بعد</p>
          <Link
            href="/admin/projects/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              marginTop: "1rem",
              color: "var(--primary)",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
          >
            <Plus size={14} /> أضف أول مشروع
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {projects.map((project, idx) => (
            <div
              key={project.id}
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                background: "var(--surface)",
                borderRadius: "0.75rem",
                border: "1px solid var(--border)",
                padding: "0.75rem 1rem",
                transition: "box-shadow 0.2s",
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  width: 70,
                  height: 52,
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "var(--surface-2)",
                  position: "relative",
                }}
              >
                {project.cover_image_url ? (
                  <Image
                    src={project.cover_image_url}
                    alt={project.title}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="70px"
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--border)",
                    }}
                  >
                    <FolderOpen size={20} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <p style={{ fontWeight: 700, color: "var(--primary-dark)", fontSize: "0.95rem" }}>
                    {project.title}
                  </p>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      padding: "0.15rem 0.6rem",
                      borderRadius: "2rem",
                      fontWeight: 600,
                      background: project.is_published ? "rgba(34,197,94,0.1)" : "rgba(107,114,128,0.1)",
                      color: project.is_published ? "#16A34A" : "#6B7280",
                    }}
                  >
                    {project.is_published ? "منشور" : "مخفي"}
                  </span>
                </div>
                {project.location && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                    <MapPin size={11} />
                    {project.location}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0, alignItems: "center" }}>
                {/* Reorder */}
                <button
                  onClick={() => handleReorder(idx, "up")}
                  disabled={idx === 0}
                  style={{
                    padding: "0.4rem",
                    borderRadius: "0.4rem",
                    border: "1px solid var(--border)",
                    background: "var(--surface-2)",
                    cursor: idx === 0 ? "not-allowed" : "pointer",
                    color: idx === 0 ? "var(--border)" : "var(--text-muted)",
                    display: "flex",
                  }}
                  title="تحريك للأعلى"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => handleReorder(idx, "down")}
                  disabled={idx === projects.length - 1}
                  style={{
                    padding: "0.4rem",
                    borderRadius: "0.4rem",
                    border: "1px solid var(--border)",
                    background: "var(--surface-2)",
                    cursor: idx === projects.length - 1 ? "not-allowed" : "pointer",
                    color: idx === projects.length - 1 ? "var(--border)" : "var(--text-muted)",
                    display: "flex",
                  }}
                  title="تحريك للأسفل"
                >
                  <ArrowDown size={14} />
                </button>

                {/* Toggle publish */}
                <button
                  onClick={() => handleTogglePublish(project)}
                  style={{
                    padding: "0.4rem 0.7rem",
                    borderRadius: "0.4rem",
                    border: `1px solid ${project.is_published ? "rgba(107,114,128,0.3)" : "rgba(34,197,94,0.3)"}`,
                    background: project.is_published ? "rgba(107,114,128,0.08)" : "rgba(34,197,94,0.08)",
                    cursor: "pointer",
                    color: project.is_published ? "#6B7280" : "#16A34A",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontSize: "0.75rem",
                    fontFamily: "var(--font-cairo), sans-serif",
                    fontWeight: 600,
                  }}
                >
                  {project.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                  {project.is_published ? "إخفاء" : "نشر"}
                </button>

                {/* Edit */}
                <Link
                  href={`/admin/projects/${project.id}`}
                  style={{
                    padding: "0.4rem 0.7rem",
                    borderRadius: "0.4rem",
                    border: "1px solid rgba(45,106,79,0.3)",
                    background: "rgba(45,106,79,0.08)",
                    color: "var(--primary)",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  <Pencil size={13} />
                  تعديل
                </Link>

                {/* Delete */}
                {confirmDelete === project.id ? (
                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    <button
                      onClick={() => handleDelete(project.id)}
                      disabled={deletingId === project.id}
                      style={{
                        padding: "0.4rem 0.7rem",
                        borderRadius: "0.4rem",
                        border: "1px solid rgba(220,38,38,0.5)",
                        background: "#DC2626",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        fontFamily: "var(--font-cairo), sans-serif",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      {deletingId === project.id ? (
                        <LoadingSpinner size="sm" color="white" />
                      ) : (
                        "تأكيد"
                      )}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      style={{
                        padding: "0.4rem 0.7rem",
                        borderRadius: "0.4rem",
                        border: "1px solid var(--border)",
                        background: "var(--surface-2)",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        fontFamily: "var(--font-cairo), sans-serif",
                        color: "var(--text-muted)",
                      }}
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(project.id)}
                    style={{
                      padding: "0.4rem",
                      borderRadius: "0.4rem",
                      border: "1px solid rgba(220,38,38,0.3)",
                      background: "rgba(220,38,38,0.08)",
                      cursor: "pointer",
                      color: "#DC2626",
                      display: "flex",
                    }}
                    title="حذف المشروع"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
