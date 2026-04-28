"use client";

import { useState, useEffect } from "react";
import { Info, Plus, Trash2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { upsertAboutContent } from "@/lib/queries/about";
import { uploadImage, generateFileName } from "@/lib/storage/upload";
import ImageUpload from "@/components/ui/ImageUpload";
import Toast, { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { AboutContent, AboutValue } from "@/types/database";

export default function AdminAboutPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [data, setData] = useState<AboutContent | null>(null);

  const [form, setForm] = useState({
    main_title: "",
    short_description: "",
    full_text: "",
    values: [] as AboutValue[],
    image_url: null as string | null,
  });

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: row } = await supabase
        .from("about_content")
        .select("*")
        .limit(1)
        .single();

      if (row) {
        setData(row as AboutContent);
        setForm({
          main_title: row.main_title ?? "",
          short_description: row.short_description ?? "",
          full_text: row.full_text ?? "",
          values: Array.isArray(row.values) ? row.values : [],
          image_url: row.image_url ?? null,
        });
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: saved, error } = await upsertAboutContent(data?.id ?? null, form);
    if (error) {
      showToast("حدث خطأ أثناء الحفظ: " + error, "error");
    } else {
      if (!data && saved) setData(saved);
      showToast("تم حفظ التغييرات بنجاح", "success");
    }
    setSaving(false);
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImg(true);
    const name = generateFileName(file, "about-");
    const { url, error } = await uploadImage(file, "about", name);
    if (error) {
      showToast("فشل رفع الصورة: " + error, "error");
    } else {
      setForm((p) => ({ ...p, image_url: url }));
    }
    setUploadingImg(false);
  };

  const addValue = () =>
    setForm((p) => ({ ...p, values: [...p.values, { title: "", description: "" }] }));

  const removeValue = (i: number) =>
    setForm((p) => ({ ...p, values: p.values.filter((_, idx) => idx !== i) }));

  const updateValue = (i: number, field: keyof AboutValue, val: string) =>
    setForm((p) => ({
      ...p,
      values: p.values.map((v, idx) => (idx === i ? { ...v, [field]: val } : v)),
    }));

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

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 760 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Info size={22} style={{ color: "var(--primary)" }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary-dark)" }}>من نحن</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.65rem 1.5rem",
            borderRadius: "0.6rem",
            background: saving ? "var(--primary-light)" : "var(--primary)",
            color: "white",
            border: "none",
            cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "var(--font-cairo), sans-serif",
            fontSize: "0.9rem",
            fontWeight: 700,
          }}
        >
          {saving ? <LoadingSpinner size="sm" color="white" /> : <Save size={16} />}
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* Basic info */}
        <section style={{ background: "var(--surface)", borderRadius: "1rem", padding: "1.5rem", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--primary-dark)", marginBottom: "1.25rem" }}>المعلومات الأساسية</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.4rem" }}>العنوان الرئيسي</label>
              <input
                style={inputStyle}
                value={form.main_title}
                onChange={(e) => setForm((p) => ({ ...p, main_title: e.target.value }))}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.4rem" }}>الوصف المختصر</label>
              <textarea
                style={{ ...inputStyle, resize: "vertical" }}
                rows={2}
                value={form.short_description}
                onChange={(e) => setForm((p) => ({ ...p, short_description: e.target.value }))}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.4rem" }}>النص الكامل</label>
              <textarea
                style={{ ...inputStyle, resize: "vertical" }}
                rows={6}
                value={form.full_text}
                onChange={(e) => setForm((p) => ({ ...p, full_text: e.target.value }))}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
          </div>
        </section>

        {/* Image */}
        <section style={{ background: "var(--surface)", borderRadius: "1rem", padding: "1.5rem", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--primary-dark)", marginBottom: "1.25rem" }}>الصورة الرئيسية</h2>
          <ImageUpload
            currentImageUrl={form.image_url}
            onUpload={handleImageUpload}
            onRemove={() => setForm((p) => ({ ...p, image_url: null }))}
            uploading={uploadingImg}
            label=""
          />
        </section>

        {/* Values */}
        <section style={{ background: "var(--surface)", borderRadius: "1rem", padding: "1.5rem", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--primary-dark)" }}>قيم الشركة</h2>
            <button
              onClick={addValue}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.4rem 0.9rem",
                borderRadius: "0.5rem",
                background: "rgba(45,106,79,0.1)",
                color: "var(--primary)",
                border: "1px solid rgba(45,106,79,0.2)",
                cursor: "pointer",
                fontFamily: "var(--font-cairo), sans-serif",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              <Plus size={15} /> إضافة قيمة
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {form.values.map((val, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr auto",
                  gap: "0.75rem",
                  alignItems: "start",
                  padding: "1rem",
                  background: "var(--surface-2)",
                  borderRadius: "0.6rem",
                  border: "1px solid var(--border)",
                }}
              >
                <input
                  placeholder="العنوان"
                  style={{ ...inputStyle, fontSize: "0.875rem" }}
                  value={val.title}
                  onChange={(e) => updateValue(i, "title", e.target.value)}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
                <input
                  placeholder="الوصف"
                  style={{ ...inputStyle, fontSize: "0.875rem" }}
                  value={val.description}
                  onChange={(e) => updateValue(i, "description", e.target.value)}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
                <button
                  onClick={() => removeValue(i)}
                  style={{
                    background: "rgba(220,38,38,0.08)",
                    border: "1px solid rgba(220,38,38,0.2)",
                    color: "#DC2626",
                    borderRadius: "0.5rem",
                    padding: "0.6rem",
                    cursor: "pointer",
                    display: "flex",
                    marginTop: 2,
                  }}
                  aria-label="حذف"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {form.values.length === 0 && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", textAlign: "center", padding: "1rem" }}>
                لا توجد قيم بعد — انقر "إضافة قيمة" للبدء
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Toasts */}
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
