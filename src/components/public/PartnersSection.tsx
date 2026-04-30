"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMotionValue, animate, motion } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { Partner } from "@/types/database";

// ─── constants ────────────────────────────────────────────────────────────────
const STRIP_H = 108; // px — fixed height of the logo strip
const LOGO_H  = 64;  // px — logo image height inside each cell

function getVc(w: number): number {
  if (w >= 1200) return 6;
  if (w >= 900)  return 5;
  if (w >= 640)  return 3;
  return 2;
}

// ─── Inner content (logo + name) shared between div and anchor cells ──────────
function CellContent({ partner }: { partner: Partner }) {
  return (
    <>
      {partner.logo_url ? (
        <div style={{ position: "relative", width: "78%", height: LOGO_H }}>
          <Image
            src={partner.logo_url}
            alt={partner.name}
            fill
            style={{ objectFit: "contain" }}
            sizes="220px"
          />
        </div>
      ) : (
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "0.5rem",
            background: "var(--primary-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary)",
            fontWeight: 800,
            fontSize: "1.15rem",
          }}
        >
          {partner.name.charAt(0)}
        </div>
      )}
      <span
        style={{
          fontSize: "0.68rem",
          fontWeight: 600,
          color: "var(--text-muted)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          width: "100%",
          textAlign: "center",
          marginTop: "0.1rem",
        }}
      >
        {partner.name}
      </span>
    </>
  );
}

// ─── Logo cell (used as flex child — style is injected by parent) ─────────────
function LogoCell({
  partner,
  outerStyle,
}: {
  partner: Partner;
  outerStyle: React.CSSProperties;
}) {
  const shared: React.CSSProperties = {
    ...outerStyle,
    height: STRIP_H,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.35rem",
    borderRight: "1px solid rgba(0,0,0,0.07)",
    padding: "0 1.25rem",
    userSelect: "none",
    cursor: partner.website_url ? "pointer" : "default",
    textDecoration: "none",
    color: "inherit",
    boxSizing: "border-box",
  };

  if (partner.website_url) {
    return (
      <a
        href={partner.website_url}
        target="_blank"
        rel="noopener noreferrer"
        style={shared}
      >
        <CellContent partner={partner} />
      </a>
    );
  }
  return (
    <div style={shared}>
      <CellContent partner={partner} />
    </div>
  );
}

// ─── Arrow button ─────────────────────────────────────────────────────────────
function ArrowBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="p-arrow-btn"
      style={{
        width: 42,
        height: 42,
        borderRadius: "50%",
        border: "1.5px solid var(--border)",
        background: "white",
        color: "var(--primary)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 2px 10px rgba(0,0,0,0.09)",
        transition: "background 0.2s, color 0.2s, border-color 0.2s, transform 0.15s",
      }}
    >
      {children}
    </button>
  );
}

// ─── Shared viewport container style ─────────────────────────────────────────
const VIEWPORT_STYLE: React.CSSProperties = {
  flex: 1,
  overflow: "hidden",
  borderRadius: "0.875rem",
  border: "1px solid var(--border)",
  boxShadow: "0 4px 22px rgba(0,0,0,0.06)",
  background: "white",
};

// ─── Section ──────────────────────────────────────────────────────────────────
export default function PartnersSection({ data }: { data: Partner[] }) {
  const viewRef   = useRef<HTMLDivElement>(null);
  const cellRef   = useRef(200);   // current cell px width (for use inside callbacks)
  const idxRef    = useRef(0);     // current logical index into loopItems
  const busyRef   = useRef(false); // prevents overlapping animations
  const x         = useMotionValue(0);

  const [mounted,    setMounted]    = useState(false);
  const [vc,         setVc]         = useState(5);
  const [cellWidth,  setCellWidth]  = useState(200); // drives re-render

  const N         = data.length;
  // Three copies for infinite loop — only used when N > vc
  const loopItems = useMemo(() => [...data, ...data, ...data], [data]);

  // Recalculate cell width and reposition track instantly (no animation)
  const recalc = useCallback(() => {
    const newVc = getVc(window.innerWidth);
    setVc(newVc);
    if (!viewRef.current) return;

    const containerW = viewRef.current.clientWidth;
    const cw = Math.floor(containerW / newVc);
    cellRef.current = cw;
    setCellWidth(cw);

    const needsLoop = N > newVc;
    if (needsLoop) {
      // Keep idx inside the middle copy [N, 2N)
      if (idxRef.current < N || idxRef.current >= N * 2) {
        idxRef.current = N;
      }
    } else {
      idxRef.current = 0;
    }
    x.set(-(idxRef.current * cw));
  }, [N, x]);

  useEffect(() => {
    setMounted(true);
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [recalc]);

  if (N === 0) return null;

  // showArrows is only true after mount (avoids SSR mismatch)
  const showArrows = mounted && N > vc;

  // Animate to a new index, then snap back to middle copy if needed
  const moveTo = (newIdx: number) => {
    if (busyRef.current) return;
    const cw = cellRef.current;
    if (!cw) return;
    busyRef.current = true;
    idxRef.current  = newIdx;

    animate(x, -(newIdx * cw), {
      duration: 0.48,
      ease: [0.25, 0.46, 0.45, 0.94],
      onComplete: () => {
        // Infinite-loop snap (no visible jump because position is equivalent)
        let snap = newIdx;
        if (newIdx < N)      snap = newIdx + N;
        if (newIdx >= N * 2) snap = newIdx - N;
        if (snap !== newIdx) {
          idxRef.current = snap;
          x.set(-(snap * cw));
        }
        busyRef.current = false;
      },
    });
  };

  const goPrev = () => moveTo(idxRef.current - 1); // right arrow  → prev in RTL
  const goNext = () => moveTo(idxRef.current + 1); // left  arrow  → next in RTL

  return (
    <section
      id="partners"
      style={{
        padding: "6.5rem 1.5rem",
        background: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: 2,
          background:
            "linear-gradient(90deg, transparent, var(--accent-light), transparent)",
          opacity: 0.35,
        }}
      />

      <div style={{ maxWidth: 1160, margin: "0 auto" }}>

        {/* ── Header: title on right (RTL first-child), aligned right ───── */}
        <ScrollReveal>
          <div style={{ marginBottom: "2.5rem" }}>
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--accent)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "0.4rem",
              }}
            >
              شركاؤنا
            </p>
            <h2
              style={{
                fontSize: "clamp(1.5rem, 2.8vw, 2.1rem)",
                fontWeight: 800,
                color: "var(--foreground)",
                lineHeight: 1.25,
                margin: "0 0 0.65rem",
              }}
            >
              شركاؤنا في النجاح
            </h2>
            {/* Accent underline */}
            <div
              style={{
                width: 46,
                height: 3,
                borderRadius: 2,
                background: "var(--accent)",
              }}
            />
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--text-muted)",
                marginTop: "0.7rem",
                lineHeight: 1.75,
              }}
            >
              نفتخر بشراكتنا مع نخبة من الشركات والمؤسسات الرائدة
            </p>
          </div>
        </ScrollReveal>

        {/* ── Carousel row: [right-arrow] [strip] [left-arrow] ─────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}
        >
          {/* Right arrow = Previous in RTL */}
          {showArrows ? (
            <ArrowBtn onClick={goPrev} label="السابق">
              <ChevronRight size={18} />
            </ArrowBtn>
          ) : (
            <div style={{ width: 42, flexShrink: 0 }} />
          )}

          {/* ── Strip viewport ──────────────────────────────────────────── */}
          <div ref={viewRef} style={VIEWPORT_STYLE}>

            {/* Before hydration: static flex strip (no motion, no duplicates) */}
            {!mounted && (
              <div style={{ display: "flex", height: STRIP_H }}>
                {data.slice(0, 6).map((p) => (
                  <LogoCell key={p.id} partner={p} outerStyle={{ flex: 1 }} />
                ))}
              </div>
            )}

            {/* After hydration, scrolling needed: infinite looping track */}
            {mounted && showArrows && (
              <motion.div
                dir="ltr"
                style={{ display: "flex", height: STRIP_H, x }}
              >
                {loopItems.map((partner, i) => (
                  <LogoCell
                    key={`${partner.id}-${i}`}
                    partner={partner}
                    outerStyle={{ width: cellWidth, flexShrink: 0 }}
                  />
                ))}
              </motion.div>
            )}

            {/* After hydration, all items fit: static flex strip */}
            {mounted && !showArrows && (
              <div style={{ display: "flex", height: STRIP_H }}>
                {data.map((p) => (
                  <LogoCell key={p.id} partner={p} outerStyle={{ flex: 1 }} />
                ))}
              </div>
            )}
          </div>

          {/* Left arrow = Next in RTL */}
          {showArrows ? (
            <ArrowBtn onClick={goNext} label="التالي">
              <ChevronLeft size={18} />
            </ArrowBtn>
          ) : (
            <div style={{ width: 42, flexShrink: 0 }} />
          )}
        </motion.div>
      </div>

      <style>{`
        .p-arrow-btn:hover {
          background: var(--primary) !important;
          color: white !important;
          border-color: var(--primary) !important;
          transform: scale(1.07);
        }
        .p-arrow-btn:active {
          transform: scale(0.96);
        }
      `}</style>
    </section>
  );
}
