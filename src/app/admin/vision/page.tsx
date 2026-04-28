"use client";

import { useState, useEffect } from "react";
import { Eye, Plus, Trash2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { upsertVisionContent } from "@/lib/queries/vision";
import Toast, { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { VisionContent, VisionGoal } from "@/types/database";

export default function AdminVisionPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<VisionContent | null>(null);

  const [form, setForm] = useState({
    vision_text: "",
    mission_text: "",
    goals: [] as VisionGoal[],
    stat_projects: 0,
    stat_years: 0,
    stat_clients: 0,
    stat_green_areas: 0,
  });

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: row } = await supabase
        .from("vision_content")
        .select("*")
        .limit(1)
        .single();

      if (row) {
        setData(row as VisionContent);
        setForm({
          vision_text: row.vision_text ?? "",
          mission_text: row.mission_text ?? "",
          goals: Array.isArray(row.goals) ? row.goals : [],
          stat_projects: row.stat_projects ?? 0,
          stat_years: row.stat_years ?? 0,
          stat_clients: row.stat_clients ?? 0,
          stat_green_areas: row.stat_green_areas ?? 0,
        });
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: saved, error } = await upsertVisionContent(data?.id ?? null, form);
    if (error) {
      showToast("حدث خطأ أثناء الحفظ: " + error, "error");
    } else {
      if (!data && saved) setData(saved);
      showToast("تم حفظ التغييرات بنجاح", "success");
    }
    setSaving(false);
  };

  const addGoal = () =>
    setForm((p) => ({ ...p, goals: [...p.goals, { text: "" }] }));

  const removeGoal = (i: number) =>
    setForm((p) => ({ ...p, goals: p.goals.filter((_, idx) => idx !== i) }));

  const updateGoal = (i: number, text: string) =>
    setForm((p) => ({
      ...p,
      goals: p.goals.map((g, idx) => (idx === i ? { text } : g)),
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

  const numberInputStyle: React.CSSProperties = {
    ...inputStyle,
    direction: "ltr",
    textAlign: "center",
    fontWeight: 700,
    fontSize: "1.2rem",
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
          <Eye size={22} style={{ color: "var(--primary)" }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary-dark)" }}>رؤيتنا</h1>
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
        {/* Vision & Mission */}
        <section style={{ background: "var(--surface)", borderRadius: "1rem", padding: "1.5rem", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--primary-dark)", marginBottom: "1.25rem" }}>الرؤية والرسالة</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.4rem" }}>رؤية الشركة</label>
              <textarea
                style={{ ...inputStyle, resize: "vertical" }}
                rows={3}
                value={form.vision_text}
                onChange={(e) => setForm((p) => ({ ...p, vision_text: e.target.value }))}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.4rem" }}>رسالة الشركة</label>
              <textarea
                style={{ ...inputStyle, resize: "vertical" }}
                rows={3}
                value={form.mission_text}
                onChange={(e) => setForm((p) => ({ ...p, mission_text: e.target.value }))}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
          </div>
        </section>

        {/* Goals */}
        <section style={{ background: "var(--surface)", borderRadius: "1rem", padding: "1.5rem", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--primary-dark)" }}>الأهداف</h2>
            <button
              onClick={addGoal}
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
              <Plus size={15} /> إضافة هدف
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {form.goals.map((g, i) => (
              <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <input
                  placeholder={`الهدف ${i + 1}`}
                  style={{ ...inputStyle, flex: 1 }}
                  value={g.text}
                  onChange={(e) => updateGoal(i, e.target.value)}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
                <button
                  onClick={() => removeGoal(i)}
                  style={{
                    background: "rgba(220,38,38,0.08)",
                    border: "1px solid rgba(220,38,38,0.2)",
                    color: "#DC2626",
                    borderRadius: "0.5rem",
                    padding: "0.65rem",
                    cursor: "pointer",
                    display: "flex",
                    flexShrink: 0,
                  }}
                  aria-label="حذف"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {form.goals.length === 0 && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", textAlign: "center", padding: "1rem" }}>
                لا توجد أهداف بعد
              </p>
            )}
          </div>
        </section>

        {/* Stats */}
        <section style={{ background: "var(--surface)", borderRadius: "1rem", padding: "1.5rem", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--primary-dark)", marginBottom: "1.25rem" }}>الإحصائيات (0 = مخفي)</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
            {[
              { key: "stat_projects" as const, label: "عدد المشاريع" },
              { key: "stat_years" as const, label: "سنوات الخبرة" },
              { key: "stat_clients" as const, label: "عدد العملاء" },
              { key: "stat_green_areas" as const, label: "المساحات الخضراء (ألف م²)" },
            ].map((stat) => (
              <div key={stat.key}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--text-muted)" }}>
                  {stat.label}
                </label>
                <input
                  type="number"
                  min={0}
                  style={numberInputStyle}
                  value={form[stat.key]}
                  onChange={(e) => setForm((p) => ({ ...p, [stat.key]: Number(e.target.value) }))}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
