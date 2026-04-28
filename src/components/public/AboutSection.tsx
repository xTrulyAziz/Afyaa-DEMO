"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";
import type { AboutContent } from "@/types/database";

interface AboutSectionProps {
  data: AboutContent | null;
}

const FALLBACK = {
  main_title: "عن شركة أفياء",
  short_description: "شركة أفياء للزراعة والتشجير — رواد في مجال التطوير الزراعي",
  full_text:
    "شركة أفياء هي شركة زراعية متخصصة تأسست بهدف تطوير القطاع الزراعي في المملكة العربية السعودية، من خلال تقديم حلول مبتكرة ومستدامة تسهم في تحقيق رؤية 2030.",
  values: [
    { title: "الاستدامة", description: "نلتزم بممارسات زراعية مستدامة تحافظ على البيئة." },
    { title: "الجودة", description: "نسعى دائماً لتقديم أعلى معايير الجودة في مشاريعنا." },
    { title: "الابتكار", description: "نتبنى أحدث التقنيات الزراعية لتحقيق أفضل النتائج." },
  ],
  image_url: null,
};

export default function AboutSection({ data }: AboutSectionProps) {
  const content = data ?? FALLBACK;

  return (
    <section
      id="about"
      style={{
        padding: "7rem 1.5rem",
        background: "var(--surface)",
      }}
    >
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        {/* Section Header */}
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
              من نحن
            </span>
            <h2
              style={{
                fontSize: "clamp(1.9rem, 4vw, 2.9rem)",
                fontWeight: 800,
                color: "var(--foreground)",
                lineHeight: 1.25,
              }}
            >
              {content.main_title}
            </h2>
            {content.short_description && (
              <p
                style={{
                  fontSize: "1.05rem",
                  color: "var(--text-muted)",
                  maxWidth: 540,
                  margin: "1rem auto 0",
                  lineHeight: 1.85,
                }}
              >
                {content.short_description}
              </p>
            )}
          </div>
        </ScrollReveal>

        {/* Content Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "4rem",
            alignItems: "center",
          }}
        >
          {/* Text Side */}
          <ScrollReveal direction="right">
            <div>
              <div
                style={{
                  width: 44,
                  height: 3,
                  background: "linear-gradient(90deg, var(--primary), var(--accent-light))",
                  borderRadius: 2,
                  marginBottom: "1.75rem",
                }}
              />
              <p
                style={{
                  fontSize: "1rem",
                  color: "var(--text-muted)",
                  lineHeight: 2,
                  marginBottom: "2rem",
                }}
              >
                {content.full_text}
              </p>

              {Array.isArray(content.values) && content.values.length > 0 && (
                <StaggerContainer style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {content.values.map((val, i) => (
                    <StaggerItem key={i}>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.875rem",
                          alignItems: "flex-start",
                          padding: "1rem 1.1rem",
                          background: "var(--surface-2)",
                          borderRadius: "0.875rem",
                          border: "1px solid var(--border)",
                          transition: "border-color 0.25s, box-shadow 0.25s",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.borderColor = "var(--primary-border)";
                          e.currentTarget.style.boxShadow = "var(--shadow-md)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <CheckCircle2
                          size={19}
                          style={{ color: "var(--primary)", flexShrink: 0, marginTop: 2 }}
                        />
                        <div>
                          <p style={{ fontWeight: 700, color: "var(--foreground)", marginBottom: "0.2rem", fontSize: "0.95rem" }}>
                            {val.title}
                          </p>
                          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
                            {val.description}
                          </p>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>
          </ScrollReveal>

          {/* Image Side */}
          <ScrollReveal direction="left" delay={0.1}>
            <div style={{ position: "relative" }}>
              {/* Decorative background blob */}
              <div
                style={{
                  position: "absolute",
                  top: -24,
                  right: -24,
                  width: "75%",
                  height: "75%",
                  background: "var(--primary-subtle)",
                  borderRadius: "2rem",
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  borderRadius: "1.5rem",
                  overflow: "hidden",
                  aspectRatio: "4/3",
                  background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                {content.image_url ? (
                  <Image
                    src={content.image_url}
                    alt={content.main_title}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "rgba(255,255,255,0.25)",
                      gap: "0.75rem",
                    }}
                  >
                    <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
                      <path d="M12 22V12M12 12C12 12 8 9 4 9M12 12C12 12 16 9 20 9M12 12C12 8 10 5 7 3M12 12C12 8 14 5 17 3" strokeLinecap="round" />
                    </svg>
                    <span style={{ fontSize: "0.85rem" }}>صورة الشركة</span>
                  </div>
                )}
              </div>
              {/* Accent dot */}
              <div
                style={{
                  position: "absolute",
                  bottom: -14,
                  left: -14,
                  width: 50,
                  height: 50,
                  borderRadius: "0.875rem",
                  background: "var(--accent-light)",
                  opacity: 0.6,
                  zIndex: 0,
                }}
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
