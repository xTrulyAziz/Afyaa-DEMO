"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "من نحن", href: "#about" },
  { label: "رؤيتنا", href: "#vision" },
  { label: "شركاؤنا", href: "#partners" },
  { label: "مشاريعنا", href: "#projects" },
  { label: "فريقنا", href: "#team" },
  { label: "تواصل معنا", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        left: 0,
        zIndex: 1000,
        backgroundColor: "rgba(255,255,255,0.98)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        boxShadow: scrolled ? "0 2px 20px rgba(28,43,32,0.09)" : "none",
        transition: "box-shadow 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 70,
        }}
      >
        {/* Logo */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="relative z-50 flex items-center"
          style={{ textDecoration: "none" }}
        >
          <Image
            src="/brand/logo.png"
            alt="أفياء"
            width={140}
            height={60}
            className="h-auto w-[140px] object-contain opacity-100"
            priority
          />
        </a>

        {/* Desktop Nav */}
        <nav className="nav-desktop" style={{ display: "flex", gap: "2.25rem", alignItems: "center" }}>
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="nav-link"
              style={{
                background: "none",
                border: "none",
                color: "var(--foreground)",
                fontSize: "0.9rem",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "var(--font-cairo), sans-serif",
                padding: "0.25rem 0",
                transition: "color 0.2s",
              }}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleNavClick("#contact")}
            className="nav-cta"
            style={{
              background: "var(--primary)",
              color: "white",
              border: "none",
              padding: "0.5rem 1.4rem",
              borderRadius: "2rem",
              fontSize: "0.875rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--font-cairo), sans-serif",
              boxShadow: "0 2px 10px rgba(45,106,79,0.25)",
              transition: "opacity 0.2s, transform 0.2s",
            }}
          >
            تواصل الآن
          </button>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="nav-mobile-btn"
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "var(--foreground)",
            cursor: "pointer",
            padding: "0.25rem",
          }}
          aria-label="القائمة"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div
          style={{
            background: "white",
            borderTop: "1px solid var(--border)",
            padding: "1rem 2rem 1.5rem",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          }}
        >
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              style={{
                display: "block",
                width: "100%",
                background: "none",
                border: "none",
                color: "var(--foreground)",
                fontSize: "1rem",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "var(--font-cairo), sans-serif",
                padding: "0.75rem 0",
                textAlign: "right",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleNavClick("#contact")}
            style={{
              marginTop: "1rem",
              width: "100%",
              background: "var(--primary)",
              color: "white",
              border: "none",
              padding: "0.75rem",
              borderRadius: "0.6rem",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--font-cairo), sans-serif",
            }}
          >
            تواصل الآن
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-btn { display: none !important; }
        }
        .nav-link:hover { color: var(--primary) !important; }
        .nav-cta:hover { opacity: 0.85; transform: translateY(-1px); }
      `}</style>
    </header>
  );
}
