"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Users, Plus, Pencil, Trash2, Eye, EyeOff,
  ArrowUp, ArrowDown, Save, X, AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  getAllTeamMembers, createTeamMember, updateTeamMember,
  deleteTeamMember, updateTeamOrder,
} from "@/lib/queries/team";
import { uploadImage, generateFileName } from "@/lib/storage/upload";
import ImageUpload from "@/components/ui/ImageUpload";
import Toast, { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { TeamMember } from "@/types/database";

const emptyForm = { name: "", job_title: "", image_url: null as string | null, is_published: true, display_order: 0 };

export default function AdminTeamPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Delete state
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        setSessionError("جلسة تسجيل الدخول منتهية. يرجى تسجيل الدخول مجدداً.");
      }
    })();
  }, []);

  const fetchMembers = useCallback(async () => {
    const data = await getAllTeamMembers();
    setMembers(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, display_order: members.length });
    setModalOpen(true);
  };

  const openEdit = (m: TeamMember) => {
    setEditing(m);
    setForm({ name: m.name, job_title: m.job_title, image_url: m.image_url, is_published: m.is_published, display_order: m.display_order });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const name = generateFileName(file, `team-${editing?.id ?? "new"}-`);
    const { url, error } = await uploadImage(file, "team", name);
    if (error) showToast("فشل رفع الصورة: " + error, "error");
    else setForm((p) => ({ ...p, image_url: url }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showToast("يرجى إدخال اسم عضو الفريق", "error"); return; }
    if (!form.job_title.trim()) { showToast("يرجى إدخال المسمى الوظيفي", "error"); return; }
    setSaving(true);

    const payload = {
      name: form.name,
      job_title: form.job_title,
      image_url: form.image_url,
      is_published: form.is_published,
      display_order: form.display_order,
    };

    if (editing) {
      const { error } = await updateTeamMember(editing.id, payload);
      if (error) showToast("فشل تعديل العضو: " + error, "error");
      else { showToast("تم حفظ التغييرات بنجاح", "success"); closeModal(); fetchMembers(); }
    } else {
      const { error } = await createTeamMember(payload);
      if (error) showToast("فشل إضافة العضو: " + error, "error");
      else { showToast("تمت إضافة العضو بنجاح", "success"); closeModal(); fetchMembers(); }
    }
    setSaving(false);
  };

  const handleTogglePublish = async (m: TeamMember) => {
    const { error } = await updateTeamMember(m.id, { is_published: !m.is_published });
    if (error) showToast("فشل تغيير حالة النشر: " + error, "error");
    else setMembers((prev) => prev.map((x) => x.id === m.id ? { ...x, is_published: !x.is_published } : x));
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await deleteTeamMember(id);
    if (error) showToast("فشل حذف العضو: " + error, "error");
    else { setMembers((prev) => prev.filter((m) => m.id !== id)); showToast("تم حذف العضو", "success"); }
    setDeletingId(null);
    setConfirmDelete(null);
  };

  const handleReorder = async (fromIdx: number, dir: "up" | "down") => {
    const toIdx = dir === "up" ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= members.length) return;
    const updated = [...members];
    [updated[fromIdx], updated[toIdx]] = [updated[toIdx], updated[fromIdx]];
    const withOrder = updated.map((m, i) => ({ ...m, display_order: i }));
    setMembers(withOrder);
    await updateTeamOrder(withOrder.map((m) => ({ id: m.id, display_order: m.display_order })));
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.75rem 1rem", borderRadius: "0.6rem",
    border: "1.5px solid var(--border)", background: "var(--surface)",
    fontSize: "0.95rem", fontFamily: "var(--font-cairo), sans-serif",
    outline: "none", color: "var(--foreground)", transition: "border-color 0.2s",
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}><LoadingSpinner size="lg" /></div>;

  return (
    <div style={{ padding: "2rem" }}>
      {sessionError && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1rem", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "0.6rem", color: "#DC2626", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />{sessionError}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Users size={22} style={{ color: "var(--primary)" }} />
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary-dark)" }}>فريقنا</h1>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{members.filter((m) => m.is_published).length} منشور من أصل {members.length}</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.65rem 1.5rem", borderRadius: "0.6rem", background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontFamily: "var(--font-cairo), sans-serif", fontSize: "0.9rem", fontWeight: 700 }}
        >
          <Plus size={16} /> إضافة عضو
        </button>
      </div>

      {/* Member list */}
      {members.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 2rem", background: "var(--surface)", borderRadius: "1rem", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
          <Users size={52} style={{ margin: "0 auto 1rem", color: "var(--border)", display: "block" }} />
          <p>لا يوجد أعضاء فريق بعد</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {members.map((m, idx) => (
            <div key={m.id} style={{ display: "flex", gap: "1rem", alignItems: "center", background: "var(--surface)", borderRadius: "0.75rem", border: "1px solid var(--border)", padding: "0.75rem 1rem" }}>
              {/* Avatar */}
              <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "var(--surface-2)", position: "relative", border: "2px solid var(--border)" }}>
                {m.image_url ? (
                  <Image src={m.image_url} alt={m.name} fill style={{ objectFit: "cover" }} sizes="52px" />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--border)", fontSize: "1.5rem", fontWeight: 700 }}>
                    {m.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, color: "var(--primary-dark)", fontSize: "0.95rem" }}>{m.name}</p>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{m.job_title}</p>
              </div>

              {/* Status badge */}
              <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.6rem", borderRadius: "2rem", fontWeight: 600, background: m.is_published ? "rgba(34,197,94,0.1)" : "rgba(107,114,128,0.1)", color: m.is_published ? "#16A34A" : "#6B7280", flexShrink: 0 }}>
                {m.is_published ? "منشور" : "مخفي"}
              </span>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0, alignItems: "center" }}>
                <button onClick={() => handleReorder(idx, "up")} disabled={idx === 0} style={{ padding: "0.4rem", borderRadius: "0.4rem", border: "1px solid var(--border)", background: "var(--surface-2)", cursor: idx === 0 ? "not-allowed" : "pointer", color: idx === 0 ? "var(--border)" : "var(--text-muted)", display: "flex" }}>
                  <ArrowUp size={14} />
                </button>
                <button onClick={() => handleReorder(idx, "down")} disabled={idx === members.length - 1} style={{ padding: "0.4rem", borderRadius: "0.4rem", border: "1px solid var(--border)", background: "var(--surface-2)", cursor: idx === members.length - 1 ? "not-allowed" : "pointer", color: idx === members.length - 1 ? "var(--border)" : "var(--text-muted)", display: "flex" }}>
                  <ArrowDown size={14} />
                </button>
                <button onClick={() => handleTogglePublish(m)} style={{ padding: "0.4rem 0.7rem", borderRadius: "0.4rem", border: `1px solid ${m.is_published ? "rgba(107,114,128,0.3)" : "rgba(34,197,94,0.3)"}`, background: m.is_published ? "rgba(107,114,128,0.08)" : "rgba(34,197,94,0.08)", cursor: "pointer", color: m.is_published ? "#6B7280" : "#16A34A", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", fontFamily: "var(--font-cairo), sans-serif", fontWeight: 600 }}>
                  {m.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                  {m.is_published ? "إخفاء" : "نشر"}
                </button>
                <button onClick={() => openEdit(m)} style={{ padding: "0.4rem 0.7rem", borderRadius: "0.4rem", border: "1px solid rgba(45,106,79,0.3)", background: "rgba(45,106,79,0.08)", color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                  <Pencil size={13} /> تعديل
                </button>
                {confirmDelete === m.id ? (
                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    <button onClick={() => handleDelete(m.id)} disabled={deletingId === m.id} style={{ padding: "0.4rem 0.7rem", borderRadius: "0.4rem", border: "1px solid rgba(220,38,38,0.5)", background: "#DC2626", color: "white", cursor: "pointer", fontSize: "0.75rem", fontFamily: "var(--font-cairo), sans-serif", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      {deletingId === m.id ? <LoadingSpinner size="sm" color="white" /> : "تأكيد"}
                    </button>
                    <button onClick={() => setConfirmDelete(null)} style={{ padding: "0.4rem 0.7rem", borderRadius: "0.4rem", border: "1px solid var(--border)", background: "var(--surface-2)", cursor: "pointer", fontSize: "0.75rem", fontFamily: "var(--font-cairo), sans-serif", color: "var(--text-muted)" }}>إلغاء</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(m.id)} style={{ padding: "0.4rem", borderRadius: "0.4rem", border: "1px solid rgba(220,38,38,0.3)", background: "rgba(220,38,38,0.08)", cursor: "pointer", color: "#DC2626", display: "flex" }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div onClick={closeModal} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", backdropFilter: "blur(4px)" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--surface)", borderRadius: "1.25rem", width: "100%", maxWidth: 480, boxShadow: "0 25px 60px rgba(0,0,0,0.25)", overflow: "auto", maxHeight: "90vh" }}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary-dark)" }}>
                {editing ? "تعديل العضو" : "إضافة عضو جديد"}
              </h2>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}><X size={20} /></button>
            </div>
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.4rem" }}>الاسم الكامل *</label>
                <input style={inputStyle} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="أدخل اسم العضو" onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.4rem" }}>المسمى الوظيفي *</label>
                <input style={inputStyle} value={form.job_title} onChange={(e) => setForm((p) => ({ ...p, job_title: e.target.value }))} placeholder="مثال: مدير المشاريع" onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
              </div>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
                  <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((p) => ({ ...p, is_published: e.target.checked }))} />
                  منشور (يظهر على الموقع)
                </label>
              </div>
              <ImageUpload currentImageUrl={form.image_url} onUpload={handleImageUpload} onRemove={() => setForm((p) => ({ ...p, image_url: null }))} uploading={uploading} label="صورة العضو" />
              <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.85rem", borderRadius: "0.6rem", background: saving ? "var(--primary-light)" : "var(--primary)", color: "white", border: "none", cursor: saving ? "not-allowed" : "pointer", fontFamily: "var(--font-cairo), sans-serif", fontSize: "0.95rem", fontWeight: 700 }}>
                {saving ? <LoadingSpinner size="sm" color="white" /> : <Save size={16} />}
                {saving ? "جاري الحفظ..." : (editing ? "حفظ التغييرات" : "إضافة العضو")}
              </button>
            </div>
          </div>
        </div>
      )}

      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
