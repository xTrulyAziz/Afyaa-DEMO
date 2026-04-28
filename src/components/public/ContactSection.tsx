"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ExternalLink,
  Globe2,
  Share2,
  Link2,
  Rss,
  Send,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";
import type { ContactContent } from "@/types/database";

interface ContactSectionProps {
  data: ContactContent | null;
}

const FALLBACK: ContactContent = {
  id: "",
  phone: "+966 XX XXX XXXX",
  whatsapp: "+966 XX XXX XXXX",
  email: "info@afyaa.com",
  address: "المملكة العربية السعودية",
  maps_link: "",
  facebook: "",
  instagram: "",
  twitter: "",
  linkedin: "",
  receiving_email: "info@afyaa.com",
  created_at: "",
  updated_at: "",
};

function InfoCard({
  icon,
  label,
  value,
  href,
  iconColor = "var(--primary)",
  iconBg = "var(--primary-subtle)",
  extra,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  iconColor?: string;
  iconBg?: string;
  extra?: React.ReactNode;
}) {
  const inner = (
    <motion.div
      whileHover={{ y: -2, boxShadow: "var(--shadow-md)", borderColor: "var(--primary-border)" }}
      transition={{ duration: 0.2 }}
      style={{
        display: "flex",
        gap: "1rem",
        alignItems: "flex-start",
        padding: "1.1rem",
        background: "white",
        borderRadius: "0.875rem",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div style={{ width: 42, height: 42, borderRadius: "0.6rem", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: iconColor, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.15rem", fontWeight: 500 }}>{label}</p>
        <p style={{ fontWeight: 700, color: "var(--foreground)", fontSize: "0.9rem" }} dir="ltr">{value}</p>
        {extra}
      </div>
    </motion.div>
  );

  return href ? <a href={href} style={{ textDecoration: "none", display: "block" }}>{inner}</a> : inner;
}

export default function ContactSection({ data }: ContactSectionProps) {
  const content = data ?? FALLBACK;
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { setError("يرجى ملء جميع الحقول"); return; }
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, to: content.receiving_email }) });
      if (res.ok) { setSent(true); setForm({ name: "", email: "", message: "" }); }
      else setError("حدث خطأ، يرجى المحاولة مرة أخرى");
    } catch { setError("حدث خطأ، يرجى المحاولة مرة أخرى"); }
    finally { setSubmitting(false); }
  };

  const socials = [
    { icon: <Globe2 size={16} />, url: content.facebook, label: "فيسبوك" },
    { icon: <Share2 size={16} />, url: content.instagram, label: "إنستغرام" },
    { icon: <Link2 size={16} />, url: content.twitter, label: "تويتر" },
    { icon: <Rss size={16} />, url: content.linkedin, label: "لينكدإن" },
  ].filter((s) => s.url);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.75rem 1rem", borderRadius: "0.6rem",
    border: "1.5px solid var(--border)", background: "var(--surface-2)",
    fontSize: "0.9rem", fontFamily: "var(--font-cairo), sans-serif",
    outline: "none", color: "var(--foreground)", transition: "border-color 0.2s, background 0.2s",
  };

  return (
    <section id="contact" style={{ padding: "7rem 1.5rem", background: "var(--surface-2)" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        {/* Header */}
        <ScrollReveal>
          <div style={{ textAlign: "center", marginBottom: "4.5rem" }}>
            <span style={{ display: "inline-block", background: "var(--primary-subtle)", color: "var(--primary)", padding: "0.35rem 1.1rem", borderRadius: "2rem", fontSize: "0.82rem", fontWeight: 700, marginBottom: "1rem", border: "1px solid var(--primary-border)", letterSpacing: "0.04em" }}>
              تواصل معنا
            </span>
            <h2 style={{ fontSize: "clamp(1.9rem, 4vw, 2.9rem)", fontWeight: 800, color: "var(--foreground)", lineHeight: 1.25 }}>
              نحن هنا لخدمتكم
            </h2>
            <p style={{ fontSize: "1rem", color: "var(--text-muted)", maxWidth: 460, margin: "1rem auto 0", lineHeight: 1.85 }}>
              تواصلوا معنا وسيسعدنا الإجابة على استفساراتكم
            </p>
          </div>
        </ScrollReveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem", alignItems: "start" }}>
          {/* Info column */}
          <ScrollReveal direction="right">
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "1.5rem" }}>معلومات التواصل</h3>
            <StaggerContainer style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {content.phone && (
                <StaggerItem>
                  <InfoCard icon={<Phone size={17} />} label="هاتف" value={content.phone} href={`tel:${content.phone}`} />
                </StaggerItem>
              )}
              {content.whatsapp && (
                <StaggerItem>
                  <InfoCard
                    icon={<MessageCircle size={17} />}
                    label="واتساب"
                    value={content.whatsapp}
                    href={`https://wa.me/${content.whatsapp.replace(/\s+/g, "").replace("+", "")}`}
                    iconColor="#25D366"
                    iconBg="rgba(37,211,102,0.08)"
                  />
                </StaggerItem>
              )}
              {content.email && (
                <StaggerItem>
                  <InfoCard icon={<Mail size={17} />} label="البريد الإلكتروني" value={content.email} href={`mailto:${content.email}`} iconColor="var(--accent)" iconBg="var(--accent-subtle)" />
                </StaggerItem>
              )}
              {content.address && (
                <StaggerItem>
                  <InfoCard
                    icon={<MapPin size={17} />}
                    label="العنوان"
                    value={content.address}
                    extra={content.maps_link ? (
                      <a href={content.maps_link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--primary)", textDecoration: "none", marginTop: "0.2rem", fontWeight: 600 }}>
                        عرض على الخريطة <ExternalLink size={10} />
                      </a>
                    ) : undefined}
                  />
                </StaggerItem>
              )}
            </StaggerContainer>

            {socials.length > 0 && (
              <div style={{ marginTop: "2rem" }}>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.75rem", fontWeight: 600 }}>تابعونا على</p>
                <div style={{ display: "flex", gap: "0.6rem" }}>
                  {socials.map((s) => (
                    <motion.a
                      key={s.label}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.label}
                      whileHover={{ y: -3, backgroundColor: "var(--primary)", color: "white" }}
                      transition={{ duration: 0.2 }}
                      style={{ width: 38, height: 38, borderRadius: "0.6rem", background: "white", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", textDecoration: "none", boxShadow: "var(--shadow-sm)" }}
                    >
                      {s.icon}
                    </motion.a>
                  ))}
                </div>
              </div>
            )}
          </ScrollReveal>

          {/* Form */}
          <ScrollReveal direction="left" delay={0.1}>
            <div style={{ background: "white", borderRadius: "1.25rem", padding: "2rem", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "1.5rem" }}>أرسل لنا رسالة</h3>

              {sent ? (
                <div style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--primary)", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.5 }}>
                    <CheckCircle2 size={52} />
                  </motion.div>
                  <div>
                    <p style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.4rem" }}>تم إرسال رسالتك!</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>سنتواصل معك في أقرب وقت ممكن.</p>
                  </div>
                  <button onClick={() => setSent(false)} style={{ border: "1px solid var(--primary)", color: "var(--primary)", background: "none", padding: "0.5rem 1.5rem", borderRadius: "2rem", cursor: "pointer", fontFamily: "var(--font-cairo), sans-serif", fontSize: "0.875rem", fontWeight: 700 }}>
                    إرسال رسالة أخرى
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.4rem" }}>الاسم الكامل *</label>
                    <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="أدخل اسمك" style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.background = "white"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface-2)"; }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.4rem" }}>البريد الإلكتروني *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="example@email.com" dir="ltr" style={{ ...inputStyle, textAlign: "left" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.background = "white"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface-2)"; }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.4rem" }}>الرسالة *</label>
                    <textarea value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} placeholder="اكتب رسالتك هنا..." rows={4} style={{ ...inputStyle, resize: "vertical" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.background = "white"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface-2)"; }}
                    />
                  </div>
                  {error && <p style={{ color: "#DC2626", fontSize: "0.85rem" }}>{error}</p>}
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={!submitting ? { scale: 1.01 } : {}}
                    whileTap={!submitting ? { scale: 0.98 } : {}}
                    style={{ background: "var(--primary)", color: "white", border: "none", padding: "0.85rem 2rem", borderRadius: "0.6rem", fontSize: "0.95rem", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "var(--font-cairo), sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", opacity: submitting ? 0.7 : 1, marginTop: "0.25rem", boxShadow: "0 4px 14px rgba(45,106,79,0.25)" }}
                  >
                    {submitting ? "جاري الإرسال..." : (<><Send size={15} /> إرسال الرسالة</>)}
                  </motion.button>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
