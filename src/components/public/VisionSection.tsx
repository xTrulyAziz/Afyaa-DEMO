"use client";

import { Target, Eye, TrendingUp, Users, Leaf, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";
import type { VisionContent } from "@/types/database";

interface VisionSectionProps {
  data: VisionContent | null;
}

const FALLBACK: VisionContent = {
  id: "",
  vision_text: "أن نكون الشريك الزراعي الأول والأكثر موثوقية في المملكة العربية السعودية.",
  mission_text: "تطوير القطاع الزراعي من خلال تقديم حلول مبتكرة ومستدامة تسهم في تحقيق رؤية 2030.",
  goals: [
    { text: "توسيع المساحات الخضراء في المناطق الحضرية" },
    { text: "تطوير مشاريع زراعية متكاملة" },
    { text: "دعم الاستدامة البيئية والاقتصادية" },
  ],
  stat_projects: 0,
  stat_years: 0,
  stat_clients: 0,
  stat_green_areas: 0,
  created_at: "",
  updated_at: "",
};

function StatCard({ value, label, icon }: { value: number; label: string; icon: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "var(--shadow-lg)" }}
      transition={{ duration: 0.22 }}
      style={{
        textAlign: "center",
        padding: "2rem 1.25rem",
        background: "white",
        borderRadius: "1.25rem",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        cursor: "default",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem", color: "var(--primary)" }}>
        {icon}
      </div>
      <div style={{ fontSize: "2.6rem", fontWeight: 800, color: "var(--primary-dark)", lineHeight: 1.1 }}>
        {value}
        <span style={{ color: "var(--accent-light)", fontSize: "1.5rem" }}>+</span>
      </div>
      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.35rem", fontWeight: 500 }}>
        {label}
      </div>
    </motion.div>
  );
}

export default function VisionSection({ data }: VisionSectionProps) {
  const content = data ?? FALLBACK;

  const stats = [
    { value: content.stat_projects, label: "مشروع منجز", icon: <BarChart2 size={26} /> },
    { value: content.stat_years, label: "سنة من الخبرة", icon: <TrendingUp size={26} /> },
    { value: content.stat_clients, label: "عميل راضٍ", icon: <Users size={26} /> },
    { value: content.stat_green_areas, label: "ألف م² خضراء", icon: <Leaf size={26} /> },
  ].filter((s) => s.value > 0);

  const hasStats = stats.length > 0;

  return (
    <section
      id="vision"
      style={{
        background: "var(--surface-2)",
        padding: "7rem 1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative top line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: 2,
          background: "linear-gradient(90deg, transparent, var(--primary-light), transparent)",
          opacity: 0.4,
        }}
      />

      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        {/* Header */}
        <ScrollReveal>
          <div style={{ textAlign: "center", marginBottom: "4.5rem" }}>
            <span
              style={{
                display: "inline-block",
                background: "var(--primary-subtle)",
                color: "var(--primary)",
                padding: "0.35rem 1.1rem",
                borderRadius: "2rem",
                fontSize: "0.82rem",
                fontWeight: 700,
                marginBottom: "1rem",
                border: "1px solid var(--primary-border)",
                letterSpacing: "0.04em",
              }}
            >
              رؤيتنا
            </span>
            <h2
              style={{
                fontSize: "clamp(1.9rem, 4vw, 2.9rem)",
                fontWeight: 800,
                color: "var(--foreground)",
                lineHeight: 1.25,
              }}
            >
              رؤيتنا ورسالتنا
            </h2>
          </div>
        </ScrollReveal>

        {/* Vision & Mission & Goals */}
        <StaggerContainer
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginBottom: hasStats ? "3.5rem" : 0,
          }}
        >
          {/* Vision */}
          <StaggerItem>
            <motion.div
              whileHover={{ y: -3, boxShadow: "var(--shadow-md)" }}
              transition={{ duration: 0.22 }}
              style={{
                padding: "2rem",
                background: "white",
                borderRadius: "1.25rem",
                border: "1px solid var(--border)",
                borderTop: "3px solid var(--primary)",
                boxShadow: "var(--shadow-sm)",
                height: "100%",
              }}
            >
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "0.75rem",
                    background: "var(--primary-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--primary)",
                  }}
                >
                  <Eye size={20} />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)" }}>رؤيتنا</h3>
              </div>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.9, fontSize: "0.95rem" }}>
                {content.vision_text}
              </p>
            </motion.div>
          </StaggerItem>

          {/* Mission */}
          <StaggerItem>
            <motion.div
              whileHover={{ y: -3, boxShadow: "var(--shadow-md)" }}
              transition={{ duration: 0.22 }}
              style={{
                padding: "2rem",
                background: "white",
                borderRadius: "1.25rem",
                border: "1px solid var(--border)",
                borderTop: "3px solid var(--accent-light)",
                boxShadow: "var(--shadow-sm)",
                height: "100%",
              }}
            >
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "0.75rem",
                    background: "var(--accent-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent)",
                  }}
                >
                  <Target size={20} />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)" }}>رسالتنا</h3>
              </div>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.9, fontSize: "0.95rem" }}>
                {content.mission_text}
              </p>
            </motion.div>
          </StaggerItem>

          {/* Goals */}
          {Array.isArray(content.goals) && content.goals.length > 0 && (
            <StaggerItem>
              <motion.div
                whileHover={{ y: -3, boxShadow: "var(--shadow-md)" }}
                transition={{ duration: 0.22 }}
                style={{
                  padding: "2rem",
                  background: "white",
                  borderRadius: "1.25rem",
                  border: "1px solid var(--border)",
                  borderTop: "3px solid var(--primary-light)",
                  boxShadow: "var(--shadow-sm)",
                  height: "100%",
                }}
              >
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "0.75rem",
                      background: "rgba(82,183,136,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--primary-light)",
                    }}
                  >
                    <Target size={20} />
                  </div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)" }}>أهدافنا</h3>
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {content.goals.map((g, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        gap: "0.6rem",
                        alignItems: "flex-start",
                        color: "var(--text-muted)",
                        fontSize: "0.9rem",
                        lineHeight: 1.65,
                      }}
                    >
                      <span style={{ color: "var(--primary)", fontWeight: 700, fontSize: "1rem", flexShrink: 0, lineHeight: 1.6 }}>•</span>
                      {g.text}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </StaggerItem>
          )}
        </StaggerContainer>

        {/* Statistics */}
        {hasStats && (
          <ScrollReveal delay={0.1}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, minmax(140px, 1fr))`,
                gap: "1.25rem",
              }}
            >
              {stats.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
