import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No session → render bare so /admin/login can display itself.
  // Middleware has already redirected every other unauthenticated request.
  if (!user) {
    return <>{children}</>;
  }

  // Defense-in-depth: verify admin email even after middleware check.
  // Fail secure: if ADMIN_EMAIL is not configured, deny everyone.
  const allowedEmail = process.env.ADMIN_EMAIL;
  if (!allowedEmail || user.email !== allowedEmail) {
    redirect("/admin/login");
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
      <div className="admin-mobile-sidebar">
        <AdminSidebar mobile />
      </div>
      <main style={{ flex: 1, minWidth: 0, overflow: "auto" }}>{children}</main>
      <style>{`
        .admin-desktop-sidebar { display: block; }
        .admin-mobile-sidebar  { display: none;  }
        @media (max-width: 768px) {
          .admin-desktop-sidebar { display: none;  }
          .admin-mobile-sidebar  { display: block; }
        }
      `}</style>
    </div>
  );
}
