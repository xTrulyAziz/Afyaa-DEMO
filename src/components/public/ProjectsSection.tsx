"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Calendar, Tag, ChevronLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/components/ui/ScrollReveal";
import type { Project } from "@/types/database";

interface ProjectsSectionProps {
  data: Project[];
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [activeImg, setActiveImg] = useState<string>(project.cover_image_url ?? "");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2000,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          backdropFilter: "blur(6px)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "white",
            borderRadius: "1.5rem",
            width: "100%",
            maxWidth: 780,
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 30px 70px rgba(0,0,0,0.25)",
            position: "relative",
          }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              zIndex: 10,
              background: "rgba(0,0,0,0.45)",
              border: "none",
              color: "white",
              borderRadius: "50%",
              width: 34,
              height: 34,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            <X size={16} />
          </button>

          {/* Main image */}
          <div
            style={{
              height: 300,
              background: "var(--surface-3)",
              position: "relative",
              borderRadius: "1.5rem 1.5rem 0 0",
              overflow: "hidden",
            }}
          >
            {(activeImg || project.cover_image_url) ? (
              <Image src={activeImg || project.cover_image_url!} alt={project.title} fill style={{ objectFit: "cover" }} sizes="780px" />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--border)" }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M12 22V12M12 12C12 12 8 9 4 9M12 12C12 12 16 9 20 9" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>

          {/* Gallery thumbnails */}
          {project.project_images && project.project_images.length > 0 && (
            <div style={{ display: "flex", gap: "0.5rem", padding: "0.75rem 1.5rem", overflowX: "auto", background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
              {project.cover_image_url && (
                <button onClick={() => setActiveImg(project.cover_image_url!)} style={{ flexShrink: 0, width: 58, height: 44, borderRadius: "0.4rem", overflow: "hidden", border: activeImg === project.cover_image_url ? "2px solid var(--primary)" : "2px solid transparent", cursor: "pointer", position: "relative" }}>
                  <Image src={project.cover_image_url} alt="" fill style={{ objectFit: "cover" }} sizes="58px" />
                </button>
              )}
              {project.project_images.map((img) => (
                <button key={img.id} onClick={() => setActiveImg(img.image_url)} style={{ flexShrink: 0, width: 58, height: 44, borderRadius: "0.4rem", overflow: "hidden", border: activeImg === img.image_url ? "2px solid var(--primary)" : "2px solid transparent", cursor: "pointer", position: "relative" }}>
                  <Image src={img.image_url} alt="" fill style={{ objectFit: "cover" }} sizes="58px" />
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div style={{ padding: "1.75rem 2rem" }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--foreground)", marginBottom: "0.75rem" }}>
              {project.title}
            </h3>
            <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
              {project.location && (
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                  <MapPin size={13} /> {project.location}
                </span>
              )}
              {project.category && (
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                  <Tag size={13} /> {project.category}
                </span>
              )}
              {project.project_date && (
                <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                  <Calendar size={13} /> {new Date(project.project_date).toLocaleDateString("ar-SA", { year: "numeric", month: "long" })}
                </span>
              )}
            </div>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.95, fontSize: "0.95rem" }}>
              {project.description}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "var(--shadow-lg)" }}
      transition={{ duration: 0.25 }}
      onClick={onOpen}
      style={{
        background: "white",
        borderRadius: "1.25rem",
        overflow: "hidden",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image */}
      <div style={{ height: 210, background: "var(--surface-3)", position: "relative", overflow: "hidden" }}>
        {project.cover_image_url ? (
          <Image
            src={project.cover_image_url}
            alt={project.title}
            fill
            style={{ objectFit: "cover", transition: "transform 0.4s" }}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--border)" }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M12 22V12M12 12C12 12 8 9 4 9M12 12C12 12 16 9 20 9" strokeLinecap="round" />
            </svg>
          </div>
        )}
        {project.category && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(255,255,255,0.92)",
              color: "var(--primary)",
              padding: "0.25rem 0.75rem",
              borderRadius: "2rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              backdropFilter: "blur(4px)",
              border: "1px solid var(--primary-border)",
            }}
          >
            {project.category}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "1.25rem 1.35rem", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.4rem", lineHeight: 1.4 }}>
          {project.title}
        </h3>
        {project.location && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "0.6rem" }}>
            <MapPin size={12} /> {project.location}
          </div>
        )}
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.7, flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {project.description}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--primary)", fontSize: "0.82rem", fontWeight: 700, marginTop: "1rem" }}>
          عرض التفاصيل <ChevronLeft size={13} />
        </div>
      </div>
    </motion.div>
  );
}

export default function ProjectsSection({ data }: ProjectsSectionProps) {
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <section id="projects" style={{ padding: "7rem 1.5rem", background: "var(--surface)" }}>
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
              مشاريعنا
            </span>
            <h2 style={{ fontSize: "clamp(1.9rem, 4vw, 2.9rem)", fontWeight: 800, color: "var(--foreground)", lineHeight: 1.25 }}>
              أبرز مشاريعنا
            </h2>
            <p style={{ fontSize: "1rem", color: "var(--text-muted)", maxWidth: 480, margin: "1rem auto 0", lineHeight: 1.85 }}>
              نفخر بتقديم مشاريع زراعية متميزة تعكس التزامنا بالجودة والاستدامة
            </p>
          </div>
        </ScrollReveal>

        {data.length === 0 ? (
          <ScrollReveal>
            <div style={{ textAlign: "center", padding: "5rem 2rem", color: "var(--text-muted)", background: "var(--surface-2)", borderRadius: "1.25rem", border: "1px solid var(--border)" }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: "0 auto 1rem", color: "var(--border)", display: "block" }}>
                <path d="M12 22V12M12 12C12 12 8 9 4 9M12 12C12 12 16 9 20 9" strokeLinecap="round" />
              </svg>
              <p>لم يتم إضافة أي مشاريع بعد</p>
            </div>
          </ScrollReveal>
        ) : (
          <StaggerContainer
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.75rem",
            }}
          >
            {data.map((project) => (
              <StaggerItem key={project.id}>
                <ProjectCard project={project} onOpen={() => setSelected(project)} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
