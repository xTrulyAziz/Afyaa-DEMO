import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LayoutDashboard, Info, Eye, FolderOpen, Phone, Users, ExternalLink } from "lucide-react";
import Link from "next/link";

async function getStats() {
  const supabase = await createClient();
  const { count: total } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });
  const { count: published } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);
  return { total: total ?? 0, published: published ?? 0 };
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const stats = await getStats();

  const cards = [
    {
      title: "من نحن",
      description: "تعديل محتوى صفحة الشركة والقيم والصورة الرئيسية",
      href: "/admin/about",
      icon: Info,
      color: "#2D6A4F",
      bg: "rgba(45,106,79,0.1)",
    },
    {
      title: "رؤيتنا",
      description: "تعديل الرؤية والرسالة والأهداف والإحصائيات",
      href: "/admin/vision",
      icon: Eye,
      color: "#52B788",
      bg: "rgba(82,183,136,0.1)",
    },
    {
      title: "المشاريع",
      description: `إدارة المشاريع — ${stats.published} منشور من أصل ${stats.total}`,
      href: "/admin/projects",
      icon: FolderOpen,
      color: "#B7935E",
      bg: "rgba(183,147,94,0.1)",
    },
    {
      title: "فريقنا",
      description: "إدارة أعضاء الفريق وصورهم ومسمياتهم الوظيفية",
      href: "/admin/team",
      icon: Users,
      color: "#52B788",
      bg: "rgba(82,183,136,0.1)",
    },
    {
      title: "تواصل معنا",
      description: "تعديل معلومات التواصل وروابط التواصل الاجتماعي",
      href: "/admin/contact",
      icon: Phone,
      color: "#1B3A2D",
      bg: "rgba(27,58,45,0.1)",
    },
  ];

  return (
    <div style={{ padding: "2rem" }}>
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
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
            <LayoutDashboard size={22} style={{ color: "var(--primary)" }} />
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary-dark)" }}>
              لوحة التحكم
            </h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            مرحباً، يمكنك إدارة محتوى الموقع من هنا
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.25rem",
            borderRadius: "0.6rem",
            background: "var(--primary)",
            color: "white",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <ExternalLink size={15} />
          عرض الموقع
        </a>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {[
          { label: "إجمالي المشاريع", value: stats.total, color: "var(--accent)" },
          { label: "المشاريع المنشورة", value: stats.published, color: "var(--primary)" },
          { label: "المشاريع المخفية", value: stats.total - stats.published, color: "var(--text-muted)" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "var(--surface)",
              borderRadius: "1rem",
              padding: "1.25rem",
              border: "1px solid var(--border)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ fontSize: "2rem", fontWeight: 800, color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary-dark)", marginBottom: "1rem" }}>
        إدارة المحتوى
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              style={{
                display: "block",
                background: "var(--surface)",
                borderRadius: "1rem",
                padding: "1.5rem",
                border: "1px solid var(--border)",
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "0.75rem",
                  background: card.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: card.color,
                  marginBottom: "1rem",
                }}
              >
                <Icon size={22} />
              </div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--primary-dark)", marginBottom: "0.4rem" }}>
                {card.title}
              </h3>
              <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                {card.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
