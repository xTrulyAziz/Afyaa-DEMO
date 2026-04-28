"use client";

import Image from "next/image";
import { UserCircle2 } from "lucide-react";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";
import { motion } from "framer-motion";
import type { TeamMember } from "@/types/database";

interface TeamSectionProps {
  data: TeamMember[];
}

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "var(--shadow-lg)" }}
      transition={{ duration: 0.25 }}
      style={{
        background: "white",
        borderRadius: "1.25rem",
        overflow: "hidden",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        textAlign: "center",
        padding: "2rem 1.5rem 1.75rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          overflow: "hidden",
          flexShrink: 0,
          position: "relative",
          background: "var(--primary-subtle)",
          border: "3px solid var(--primary-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {member.image_url ? (
          <Image
            src={member.image_url}
            alt={member.name}
            fill
            style={{ objectFit: "cover" }}
            sizes="96px"
          />
        ) : (
          <UserCircle2 size={52} style={{ color: "var(--primary-light)" }} />
        )}
      </div>

      {/* Name */}
      <div>
        <h3
          style={{
            fontSize: "1.05rem",
            fontWeight: 700,
            color: "var(--foreground)",
            marginBottom: "0.3rem",
          }}
        >
          {member.name}
        </h3>
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--primary)",
            fontWeight: 600,
          }}
        >
          {member.job_title}
        </p>
      </div>
    </motion.div>
  );
}

export default function TeamSection({ data }: TeamSectionProps) {
  if (data.length === 0) return null;

  return (
    <section
      id="team"
      style={{
        padding: "7rem 1.5rem",
        background: "var(--surface-2)",
      }}
    >
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
              فريقنا
            </span>
            <h2
              style={{
                fontSize: "clamp(1.9rem, 4vw, 2.9rem)",
                fontWeight: 800,
                color: "var(--foreground)",
                lineHeight: 1.25,
              }}
            >
              تعرف على فريقنا
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--text-muted)",
                maxWidth: 480,
                margin: "1rem auto 0",
                lineHeight: 1.85,
              }}
            >
              كفاءات متخصصة تعمل معاً لتحقيق أفضل النتائج في مجال الزراعة والتشجير
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1.75rem",
          }}
        >
          {data.map((member) => (
            <StaggerItem key={member.id}>
              <MemberCard member={member} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
