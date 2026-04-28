"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { Eye, EyeOff, LogIn } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    // Step 1: attempt sign-in with Supabase
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[Admin Login] signInError:", signInError);
      console.log("[Admin Login] user:", data?.user?.email ?? null);
      console.log("[Admin Login] NEXT_PUBLIC_ADMIN_EMAIL:", process.env.NEXT_PUBLIC_ADMIN_EMAIL);
    }

    // Step 2: surface the real Supabase error
    if (signInError) {
      setError(
        process.env.NODE_ENV === "development"
          ? `Supabase: ${signInError.message}`
          : "بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى."
      );
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("لم يتم التعرف على المستخدم. يرجى المحاولة مرة أخرى.");
      setLoading(false);
      return;
    }

    // Step 3: check admin email AFTER Supabase confirms the user
    const allowedEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (allowedEmail && data.user.email !== allowedEmail) {
      await supabase.auth.signOut();
      setError(
        process.env.NODE_ENV === "development"
          ? `غير مصرح: البريد المسجَّل هو "${data.user.email}" والمسموح هو "${allowedEmail}"`
          : "غير مصرح لك بالوصول إلى لوحة التحكم."
      );
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.875rem 1rem",
    borderRadius: "0.6rem",
    border: "1.5px solid var(--border)",
    background: "var(--surface)",
    fontSize: "0.95rem",
    fontFamily: "var(--font-cairo), sans-serif",
    outline: "none",
    color: "var(--foreground)",
    transition: "border-color 0.2s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1B3A2D 0%, #2D6A4F 100%)",
        padding: "1.5rem",
        fontFamily: "var(--font-cairo), sans-serif",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "1.5rem",
          padding: "2.5rem",
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: "1.25rem",
              background: "linear-gradient(135deg, #2D6A4F, #1B3A2D)",
              marginBottom: "1rem",
              boxShadow: "0 8px 24px rgba(45,106,79,0.3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Image
              src="/brand/logo.png"
              alt="أفياء"
              width={140}
              height={60}
              className="h-auto w-[140px] object-contain"
              style={{ filter: "brightness(0) invert(1)", padding: "8px" }}
            />
          </div>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              color: "var(--primary-dark)",
              marginBottom: "0.25rem",
            }}
          >
            لوحة تحكم أفياء
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            تسجيل الدخول للمشرف فقط
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--foreground)",
                marginBottom: "0.4rem",
              }}
            >
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@afyaa.com"
              required
              dir="ltr"
              style={{ ...inputStyle, textAlign: "left" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--foreground)",
                marginBottom: "0.4rem",
              }}
            >
              كلمة المرور
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                dir="ltr"
                style={{ ...inputStyle, textAlign: "left", paddingLeft: "2.5rem" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  display: "flex",
                }}
                aria-label="إظهار/إخفاء كلمة المرور"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                background: "rgba(220,38,38,0.08)",
                border: "1px solid rgba(220,38,38,0.2)",
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                color: "#DC2626",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading
                ? "var(--primary-light)"
                : "linear-gradient(135deg, var(--primary), var(--primary-dark))",
              color: "white",
              border: "none",
              padding: "0.875rem",
              borderRadius: "0.6rem",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "var(--font-cairo), sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 15px rgba(45,106,79,0.3)",
              transition: "opacity 0.2s",
              marginTop: "0.25rem",
            }}
          >
            {loading ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              <>
                <LogIn size={18} />
                تسجيل الدخول
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
