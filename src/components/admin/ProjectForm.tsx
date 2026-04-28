"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, Trash2, Eye, EyeOff, X, AlertCircle } from "lucide-react";
import {
  createProject,
  updateProject,
  addProjectImage,
  deleteProjectImage,
} from "@/lib/queries/projects";
import { uploadImage, generateFileName } from "@/lib/storage/upload";
import { createClient } from "@/lib/supabase/client";
import ImageUpload from "@/components/ui/ImageUpload";
import Toast, { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { Project, ProjectImage } from "@/types/database";

interface ProjectFormProps {
  project?: Project;
  mode: "create" | "edit";
}

export default function ProjectForm({ project, mode }: ProjectFormProps) {
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<ProjectImage[]>(
    project?.project_images ?? []
  );

  const [form, setForm] = useState({
    title: project?.title ?? "",
    description: project?.description ?? "",
    location: project?.location ?? "",
    category: project?.category ?? "",
    project_date: project?.project_date ?? "",
    cover_image_url: project?.cover_image_url ?? null as string | null,
    is_published: project?.is_published ?? false,
    display_order: project?.display_order ?? 0,
  });

  // Verify session on mount so the user knows immediately if re-login is needed
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        setSessionError("جلسة تسجيل الدخول منتهية. يرجى تسجيل الدخول مجدداً.");
        if (process.env.NODE_ENV === "development")
          console.warn("[ProjectForm] No active session:", error);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!form.title.trim()) {
      showToast("يرجى إدخال عنوان المشروع", "error");
      return;
    }
    setSaving(true);

    const payload = {
      title: form.title,
      description: form.description,
      location: form.location,
      category: form.category,
      project_date: form.project_date || null,
      cover_image_url: form.cover_image_url,
      is_published: form.is_published,
      display_order: form.display_order,
    };

    if (mode === "create") {
      const { data, error } = await createProject(payload);
      if (error || !data) {
        showToast("فشل إنشاء المشروع: " + (error ?? "خطأ غير معروف"), "error");
      } else {
        showToast("تم إنشاء المشروع بنجاح", "success");
        setTimeout(() => router.push(`/admin/projects/${data.id}`), 800);
      }
    } else if (project) {
      const { error } = await updateProject(project.id, payload);
      if (error) {
        showToast("فشل حفظ التغييرات: " + error, "error");
      } else {
        showToast("تم حفظ التغييرات بنجاح", "success");
      }
    }
    setSaving(false);
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    const name = generateFileName(file, `cover-${project?.id ?? "new"}-`);
    const { url, error } = await uploadImage(file, "projects", name);
    if (error) {
      showToast("فشل رفع صورة الغلاف: " + error, "error");
    } else {
      setForm((p) => ({ ...p, cover_image_url: url }));
    }
    setUploadingCover(false);
  };

  const handleGalleryUpload = async (file: File) => {
    if (!project?.id) {
      showToast("احفظ المشروع أولاً قبل إضافة صور المعرض", "error");
      return;
    }
    setUploadingGallery(true);
    const name = generateFileName(file, `gallery-${project.id}-`);
    const { url, error } = await uploadImage(file, "projects", name);
    if (error) {
      showToast("فشل رفع الصورة: " + error, "error");
      setUploadingGallery(false);
      return;
    }

    const { data: imgData, error: dbErr } = await addProjectImage(
      project.id,
      url!,
      galleryImages.length
    );
    if (dbErr || !imgData) {
      showToast("فشل حفظ الصورة: " + (dbErr ?? "خطأ"), "error");
    } else {
      setGalleryImages((prev) => [...prev, imgData]);
      showToast("تم رفع الصورة بنجاح", "success");
    }
    setUploadingGallery(false);
  };

  const handleDeleteGalleryImage = async (img: ProjectImage) => {
    const { error } = await deleteProjectImage(img.id);
    if (error) {
      showToast("فشل حذف الصورة: " + error, "error");
    } else {
      setGalleryImages((prev) => prev.filter((i) => i.id !== img.id));
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "0.6rem",
    border: "1.5px solid var(--border)",
    background: "var(--surface)",
    fontSize: "0.95rem",
    fontFamily: "var(--font-cairo), sans-serif",
    outline: "none",
    color: "var(--foreground)",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 800 }}>
      {/* Session error banner */}
      {sessionError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.875rem 1rem",
            background: "rgba(220,38,38,0.08)",
            border: "1px solid rgba(220,38,38,0.3)",
            borderRadius: "0.6rem",
            color: "#DC2626",
            fontSize: "0.875rem",
            marginBottom: "1.5rem",
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          {sessionError}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary-dark)" }}>
            {mode === "create" ? "إضافة مشروع جديد" : "تعديل المشروع"}
          </h1>
          {mode === "edit" && project?.title && (
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
              {project.title}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, is_published: !p.is_published }))}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.65rem 1.25rem",
              borderRadius: "0.6rem",
              border: `1px solid ${form.is_published ? "rgba(107,114,128,0.3)" : "rgba(34,197,94,0.3)"}`,
              background: form.is_published ? "rgba(107,114,128,0.08)" : "rgba(34,197,94,0.08)",
              color: form.is_published ? "#6B7280" : "#16A34A",
              cursor: "pointer",
              fontFamily: "var(--font-cairo), sans-serif",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {form.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
            {form.is_published ? "إخفاء" : "نشر"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !!sessionError}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.65rem 1.5rem",
              borderRadius: "0.6rem",
              background: saving || sessionError ? "var(--primary-light)" : "var(--primary)",
              color: "white",
              border: "none",
              cursor: saving || sessionError ? "not-allowed" : "pointer",
              fontFamily: "var(--font-cairo), sans-serif",
              fontSize: "0.9rem",
              fontWeight: 700,
            }}
          >
            {saving ? <LoadingSpinner size="sm" color="white" /> : <Save size={16} />}
            {saving ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* Basic info */}
        <section style={{ background: "var(--surface)", borderRadius: "1rem", padding: "1.5rem", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--primary-dark)", marginBottom: "1.25rem" }}>معلومات المشروع</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.4rem" }}>عنوان المشروع *</label>
              <input style={inputStyle} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="أدخل عنوان المشروع" onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.4rem" }}>وصف المشروع</label>
              <textarea style={{ ...inputStyle, resize: "vertical" }} rows={5} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="أدخل وصفاً تفصيلياً للمشروع" onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.4rem" }}>الموقع</label>
                <input style={inputStyle} value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="مثال: الرياض" onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.4rem" }}>الفئة</label>
                <input style={inputStyle} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="مثال: تشجير، حدائق" onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.4rem" }}>تاريخ المشروع</label>
                <input type="date" style={{ ...inputStyle, direction: "ltr" }} value={form.project_date} onChange={(e) => setForm((p) => ({ ...p, project_date: e.target.value }))} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
              </div>
            </div>
          </div>
        </section>

        {/* Cover image */}
        <section style={{ background: "var(--surface)", borderRadius: "1rem", padding: "1.5rem", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--primary-dark)", marginBottom: "1.25rem" }}>صورة الغلاف</h2>
          <ImageUpload currentImageUrl={form.cover_image_url} onUpload={handleCoverUpload} onRemove={() => setForm((p) => ({ ...p, cover_image_url: null }))} uploading={uploadingCover} label="" />
        </section>

        {/* Gallery — edit mode only */}
        {mode === "edit" && project && (
          <section style={{ background: "var(--surface)", borderRadius: "1rem", padding: "1.5rem", border: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--primary-dark)", marginBottom: "1.25rem" }}>
              معرض الصور ({galleryImages.length})
            </h2>
            {galleryImages.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
                {galleryImages.map((img) => (
                  <div key={img.id} style={{ position: "relative", aspectRatio: "1", borderRadius: "0.5rem", overflow: "hidden", border: "2px solid var(--border)" }}>
                    <Image src={img.image_url} alt="" fill style={{ objectFit: "cover" }} sizes="100px" />
                    <button
                      type="button"
                      onClick={() => handleDeleteGalleryImage(img)}
                      style={{ position: "absolute", top: 4, right: 4, background: "rgba(220,38,38,0.9)", border: "none", color: "white", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <ImageUpload onUpload={handleGalleryUpload} uploading={uploadingGallery} label="إضافة صورة للمعرض" />
          </section>
        )}

        {mode === "create" && (
          <div style={{ padding: "1rem", background: "rgba(183,147,94,0.08)", borderRadius: "0.75rem", border: "1px solid rgba(183,147,94,0.3)", color: "#7C5E2A", fontSize: "0.875rem" }}>
            💡 بعد حفظ المشروع، يمكنك إضافة صور المعرض من صفحة التعديل.
          </div>
        )}
      </div>

      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
