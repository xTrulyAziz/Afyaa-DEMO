"use client";

import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import type { ContactContent } from "@/types/database";

interface FooterProps {
  contact: ContactContent | null;
}

export default function Footer({ contact }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "var(--primary-dark)",
        color: "rgba(255,255,255,0.8)",
        padding: "3.5rem 1.5rem 1.75rem",
      }}
    >
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "2.5rem",
          marginBottom: "2.5rem",
        }}
      >
        {/* Brand */}
        <div>
          <div style={{ marginBottom: "0.5rem" }}>
            <Image
              src="/brand/logo-nobg.png"
              alt="شعار أفياء"
              width={150}
              height={70}
              className="h-auto w-[150px] object-contain opacity-100"
            />
          </div>
          <p
            style={{
              fontSize: "0.9rem",
              fontWeight: 300,
              fontStyle: "italic",
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.08em",
              marginBottom: "0.75rem",
            }}
          >
            أفياء ظلٌ و رواء
          </p>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.85, color: "rgba(255,255,255,0.45)" }}>
            شركة أفياء للزراعة والتشجير — رواد في مجال التطوير الزراعي المستدام في المملكة العربية السعودية.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ color: "white", fontWeight: 700, marginBottom: "1rem", fontSize: "0.95rem", letterSpacing: "0.02em" }}>
            روابط سريعة
          </h4>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {[
              { label: "من نحن", href: "#about" },
              { label: "رؤيتنا", href: "#vision" },
              { label: "مشاريعنا", href: "#projects" },
              { label: "تواصل معنا", href: "#contact" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  color: "rgba(255,255,255,0.55)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  transition: "color 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
                onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Contact */}
        {contact && (
          <div>
            <h4 style={{ color: "white", fontWeight: 700, marginBottom: "1rem", fontSize: "0.95rem", letterSpacing: "0.02em" }}>
              التواصل
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {contact.phone && (
                <a href={`tel:${contact.phone}`} dir="ltr" style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: "0.875rem", transition: "color 0.2s" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                >
                  <Phone size={13} style={{ flexShrink: 0, color: "var(--primary-light)" }} />
                  {contact.phone}
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: "0.875rem", transition: "color 0.2s" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                >
                  <Mail size={13} style={{ flexShrink: 0, color: "var(--primary-light)" }} />
                  {contact.email}
                </a>
              )}
              {contact.address && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", color: "rgba(255,255,255,0.55)", fontSize: "0.875rem" }}>
                  <MapPin size={13} style={{ flexShrink: 0, color: "var(--primary-light)", marginTop: 2 }} />
                  {contact.address}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5rem", textAlign: "center" }}>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>
          © {year} شركة أفياء للزراعة والتشجير. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}
