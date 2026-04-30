"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Info,
  Eye,
  FolderOpen,
  Phone,
  Users,
  Building2,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { label: "لوحة التحكم", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "من نحن", href: "/admin/about", icon: Info },
  { label: "رؤيتنا", href: "/admin/vision", icon: Eye },
  { label: "شركاؤنا", href: "/admin/partners", icon: Building2 },
  { label: "المشاريع", href: "/admin/projects", icon: FolderOpen },
  { label: "فريقنا", href: "/admin/team", icon: Users },
  { label: "تواصل معنا", href: "/admin/contact", icon: Phone },
];

interface AdminSidebarProps {
  mobile?: boolean;
}

export default function AdminSidebar({ mobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const SidebarContent = () => (
    <aside
      style={{
        width: 240,
        minHeight: "100vh",
        background: "var(--primary-dark)",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem 0",
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        boxShadow: "2px 0 20px rgba(0,0,0,0.15)",
        fontFamily: "var(--font-cairo), sans-serif",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0 1.25rem 1.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "0.6rem",
            background: "rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Image
            src="/brand/logo.png"
            alt="أفياء"
            width={100}
            height={44}
            style={{ objectFit: "contain", padding: "4px" }}
          />
        </div>
        <div>
          <div style={{ color: "white", fontWeight: 800, fontSize: "1.1rem" }}>أفياء</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}>لوحة التحكم</div>
        </div>
        {mobile && (
          <button
            onClick={() => setOpen(false)}
            style={{
              marginRight: "auto",
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
              display: "flex",
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "0 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => {
                router.push(item.href);
                if (mobile) setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.65rem 0.9rem",
                borderRadius: "0.6rem",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-cairo), sans-serif",
                fontSize: "0.9rem",
                fontWeight: isActive ? 700 : 500,
                background: isActive ? "rgba(82,183,136,0.2)" : "transparent",
                color: isActive ? "#52B788" : "rgba(255,255,255,0.7)",
                transition: "background 0.2s, color 0.2s",
                textAlign: "right",
                width: "100%",
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = "white";
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }
              }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "1rem 0.75rem 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.65rem 0.9rem",
            borderRadius: "0.6rem",
            border: "none",
            cursor: loggingOut ? "not-allowed" : "pointer",
            fontFamily: "var(--font-cairo), sans-serif",
            fontSize: "0.9rem",
            fontWeight: 500,
            background: "transparent",
            color: "rgba(255,100,100,0.8)",
            transition: "background 0.2s",
            width: "100%",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "rgba(220,38,38,0.1)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <LogOut size={18} />
          {loggingOut ? "جاري الخروج..." : "تسجيل الخروج"}
        </button>
      </div>
    </aside>
  );

  if (mobile) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            zIndex: 200,
            background: "var(--primary-dark)",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="admin-mobile-toggle"
          aria-label="القائمة"
        >
          <Menu size={22} />
        </button>

        {open && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99,
              background: "rgba(0,0,0,0.5)",
            }}
            onClick={() => setOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <SidebarContent />
            </div>
          </div>
        )}
      </>
    );
  }

  return <SidebarContent />;
}
