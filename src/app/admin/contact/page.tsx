"use client";

import { useState, useEffect } from "react";
import { Phone, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { upsertContactContent } from "@/lib/queries/contact";
import Toast, { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { ContactContent } from "@/types/database";

// Defined outside the component so React never treats it as a new type on re-render.
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

const ltrInputStyle: React.CSSProperties = {
  ...inputStyle,
  direction: "ltr",
  textAlign: "left",
};

function Field({
  label,
  value,
  onChange,
  ltr,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  ltr?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.4rem" }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        style={ltr ? ltrInputStyle : inputStyle}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      />
    </div>
  );
}

export default function AdminContactPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ContactContent | null>(null);

  const [form, setForm] = useState({
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    maps_link: "",
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    receiving_email: "",
  });

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: row } = await supabase
        .from("contact_content")
        .select("*")
        .limit(1)
        .single();

      if (row) {
        setData(row as ContactContent);
        setForm({
          phone: row.phone ?? "",
          whatsapp: row.whatsapp ?? "",
          email: row.email ?? "",
          address: row.address ?? "",
          maps_link: row.maps_link ?? "",
          facebook: row.facebook ?? "",
          instagram: row.instagram ?? "",
          twitter: row.twitter ?? "",
          linkedin: row.linkedin ?? "",
          receiving_email: row.receiving_email ?? "",
        });
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: saved, error } = await upsertContactContent(data?.id ?? null, form);
    if (error) {
      showToast("حدث خطأ أثناء الحفظ: " + error, "error");
    } else {
      if (!data && saved) setData(saved);
      showToast("تم حفظ التغييرات بنجاح", "success");
    }
    setSaving(false);
  };

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((p) => ({ ...p, [key]: val }));

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
          <Phone size={22} style={{ color: "var(--primary)" }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary-dark)" }}>تواصل معنا</h1>
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
        {/* Contact info */}
        <section style={{ background: "var(--surface)", borderRadius: "1rem", padding: "1.5rem", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--primary-dark)", marginBottom: "1.25rem" }}>معلومات التواصل</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
            <Field label="رقم الهاتف" value={form.phone} onChange={set("phone")} ltr placeholder="+966XXXXXXXXX" />
            <Field label="رقم واتساب" value={form.whatsapp} onChange={set("whatsapp")} ltr placeholder="+966XXXXXXXXX" />
            <Field label="البريد الإلكتروني" value={form.email} onChange={set("email")} ltr type="email" placeholder="info@afyaa.com" />
            <Field label="البريد المستلم للرسائل" value={form.receiving_email} onChange={set("receiving_email")} ltr type="email" placeholder="info@afyaa.com" />
          </div>
          <div style={{ marginTop: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.4rem" }}>العنوان</label>
            <textarea
              style={{ ...inputStyle, resize: "vertical" }}
              rows={2}
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>
          <div style={{ marginTop: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.4rem" }}>رابط خرائط جوجل</label>
            <input
              type="url"
              style={ltrInputStyle}
              value={form.maps_link}
              onChange={(e) => setForm((p) => ({ ...p, maps_link: e.target.value }))}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              placeholder="https://maps.google.com/..."
            />
          </div>
        </section>

        {/* Social media */}
        <section style={{ background: "var(--surface)", borderRadius: "1rem", padding: "1.5rem", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--primary-dark)", marginBottom: "1.25rem" }}>
            روابط التواصل الاجتماعي
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
            <Field label="فيسبوك" value={form.facebook} onChange={set("facebook")} ltr placeholder="https://facebook.com/..." />
            <Field label="إنستغرام" value={form.instagram} onChange={set("instagram")} ltr placeholder="https://instagram.com/..." />
            <Field label="تويتر / X" value={form.twitter} onChange={set("twitter")} ltr placeholder="https://x.com/..." />
            <Field label="لينكدإن" value={form.linkedin} onChange={set("linkedin")} ltr placeholder="https://linkedin.com/..." />
          </div>
        </section>
      </div>

      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
