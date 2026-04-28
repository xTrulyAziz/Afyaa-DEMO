import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { ShieldAlert } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in → show login page (proxy already handles redirect,
  // but this is the safety net for the layout)
  if (!user) {
    return <>{children}</>;
  }

  // Check profiles.role = 'admin'
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = profile?.role === "admin";

  // Logged in but not admin → show access denied
  if (!isAdmin) {
    // Also enforce ADMIN_EMAIL as a fallback during initial setup
    // (before db:setup has been run, profiles table may not exist yet)
    const allowedEmail = process.env.ADMIN_EMAIL;
    const emailMatch = allowedEmail && user.email === allowedEmail;

    if (!emailMatch) {
      await supabase.auth.signOut();
      redirect("/admin/login");
    }

    // Email matches but profile not set yet → show setup warning inside the shell
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "var(--surface-2)",
          fontFamily: "var(--font-cairo), sans-serif",
        }}
      >
        <div style={{ width: 240, flexShrink: 0 }} className="admin-desktop-sidebar">
          <AdminSidebar />
        </div>
        <div className="admin-mobile-sidebar"><AdminSidebar mobile /></div>
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ maxWidth: 500, textAlign: "center", background: "var(--surface)", borderRadius: "1.25rem", padding: "2.5rem", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
            <ShieldAlert size={48} style={{ color: "var(--accent)", margin: "0 auto 1rem" }} />
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary-dark)", marginBottom: "0.75rem" }}>
              إعداد قاعدة البيانات مطلوب
            </h2>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.8, fontSize: "0.9rem", marginBottom: "1.25rem" }}>
              تم التحقق من بريدك الإلكتروني، لكن لم يتم تعيين دورك كمسؤول بعد.
              يرجى تشغيل أمر إعداد قاعدة البيانات:
            </p>
            <code style={{ display: "block", background: "var(--primary-dark)", color: "#52B788", padding: "0.75rem 1rem", borderRadius: "0.5rem", fontSize: "0.9rem", marginBottom: "1rem", fontFamily: "monospace" }}>
              npm run db:setup
            </code>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
              ثم أعد تشغيل السيرفر وسجّل الدخول مجدداً.
            </p>
          </div>
        </main>
        <style>{`.admin-desktop-sidebar{display:block}.admin-mobile-sidebar{display:none}@media(max-width:768px){.admin-desktop-sidebar{display:none}.admin-mobile-sidebar{display:block}}`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--surface-2)",
        fontFamily: "var(--font-cairo), sans-serif",
      }}
    >
      <div style={{ width: 240, flexShrink: 0 }} className="admin-desktop-sidebar">
        <AdminSidebar />
      </div>
      <div className="admin-mobile-sidebar"><AdminSidebar mobile /></div>
      <main style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
        {children}
      </main>
      <style>{`
        .admin-desktop-sidebar { display: block; }
        .admin-mobile-sidebar { display: none; }
        @media (max-width: 768px) {
          .admin-desktop-sidebar { display: none; }
          .admin-mobile-sidebar { display: block; }
        }
      `}</style>
    </div>
  );
}
