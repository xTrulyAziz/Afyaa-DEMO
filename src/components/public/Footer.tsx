"use client";

import Image from "next/image";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import type { ContactContent } from "@/types/database";

// Inline SVG social icons — lucide-react v1.11 ships no brand icons
function FacebookIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function InstagramIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function LinkedinIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
function XIcon() {
  return (
    <span style={{ fontSize: 12, fontWeight: 900, lineHeight: 1, fontFamily: "Georgia, serif", display: "inline-block" }}>
      𝕏
    </span>
  );
}

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

        {/* Contact + Social — horizontal grid */}
        {contact && (
          <div>
            <h4 style={{ color: "white", fontWeight: 700, marginBottom: "1rem", fontSize: "0.95rem", letterSpacing: "0.02em" }}>
              التواصل
            </h4>

            {/* 2-column responsive grid: contact info + socials together */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.7rem 1rem" }}>
              {[
                contact.phone && {
                  icon: <Phone size={13} />,
                  href: `tel:${contact.phone}`,
                  label: contact.phone,
                  external: false,
                },
                contact.whatsapp && {
                  icon: <MessageCircle size={13} />,
                  href: `https://wa.me/${contact.whatsapp.replace(/\s+/g, "").replace("+", "")}`,
                  label: "واتساب",
                  external: true,
                },
                contact.email && {
                  icon: <Mail size={13} />,
                  href: `mailto:${contact.email}`,
                  label: contact.email,
                  external: false,
                },
                contact.instagram && {
                  icon: <InstagramIcon size={13} />,
                  href: contact.instagram,
                  label: "إنستغرام",
                  external: true,
                },
                contact.twitter && {
                  icon: <XIcon />,
                  href: contact.twitter,
                  label: "X",
                  external: true,
                },
                contact.linkedin && {
                  icon: <LinkedinIcon size={13} />,
                  href: contact.linkedin,
                  label: "لينكدإن",
                  external: true,
                },
                contact.facebook && {
                  icon: <FacebookIcon size={13} />,
                  href: contact.facebook,
                  label: "فيسبوك",
                  external: true,
                },
              ]
                .filter(Boolean)
                .map((item) => (
                  <a
                    key={item!.label}
                    href={item!.href}
                    {...(item!.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    dir="ltr"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      color: "rgba(255,255,255,0.55)",
                      textDecoration: "none",
                      fontSize: "0.8rem",
                      transition: "color 0.2s",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
                    onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                  >
                    <span style={{ color: "var(--primary-light)", display: "flex", alignItems: "center", flexShrink: 0 }}>
                      {item!.icon}
                    </span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item!.label}</span>
                  </a>
                ))}
            </div>

            {/* Address — full width below the grid */}
            {contact.address && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", marginTop: "0.85rem" }}>
                <MapPin size={13} style={{ flexShrink: 0, color: "var(--primary-light)", marginTop: 2 }} />
                {contact.address}
              </div>
            )}
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
