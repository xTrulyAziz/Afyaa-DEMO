"use client";

import { motion } from "framer-motion";
import { ChevronDown, ArrowLeft } from "lucide-react";

const scrollTo = (id: string) => {
  const el = document.querySelector(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
};

export default function HeroSection() {
  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "linear-gradient(160deg, #1B3A2D 0%, #2D6A4F 55%, #3D8C6E 100%)",
      }}
    >
      {/* Subtle leaf pattern overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(82,183,136,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          padding: "7rem 1.5rem 4rem",
          maxWidth: 760,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "2rem",
              padding: "0.4rem 1.1rem",
              color: "rgba(255,255,255,0.85)",
              fontSize: "0.82rem",
              fontWeight: 500,
              backdropFilter: "blur(8px)",
              letterSpacing: "0.04em",
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#52B788", display: "inline-block" }} />
            شركة أفياء للزراعة والتشجير
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            fontSize: "clamp(2.6rem, 6vw, 4.8rem)",
            fontWeight: 800,
            color: "white",
            lineHeight: 1.3,
            marginBottom: "1.75rem",
            letterSpacing: "0.04em",
          }}
        >
          أفياء ظلٌ و رواء
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{
            fontSize: "clamp(1rem, 2.2vw, 1.15rem)",
            color: "rgba(255,255,255,0.78)",
            lineHeight: 1.9,
            marginBottom: "2.75rem",
            maxWidth: 560,
            margin: "0 auto 2.75rem",
          }}
        >
          رواد في مجال التطوير الزراعي والتشجير في المملكة العربية السعودية،
          نحول الأراضي إلى بيئات خضراء مستدامة
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}
        >
          <button
            onClick={() => scrollTo("#projects")}
            style={{
              background: "white",
              color: "var(--primary-dark)",
              border: "none",
              padding: "0.85rem 2.1rem",
              borderRadius: "2rem",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--font-cairo), sans-serif",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              transition: "all 0.25s",
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.2)"; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)"; }}
          >
            استكشف مشاريعنا
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={() => scrollTo("#about")}
            style={{
              background: "transparent",
              color: "white",
              border: "1.5px solid rgba(255,255,255,0.35)",
              padding: "0.85rem 2.1rem",
              borderRadius: "2rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-cairo), sans-serif",
              backdropFilter: "blur(8px)",
              transition: "all 0.25s",
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; }}
          >
            تعرف علينا
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={() => scrollTo("#about")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.5)",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.3rem",
        }}
        aria-label="التمرير للأسفل"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown size={22} />
        </motion.div>
      </motion.button>

      {/* Bottom wave */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%" }}>
          <path d="M0 80L1440 80L1440 30C1200 70 720 0 0 50L0 80Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
