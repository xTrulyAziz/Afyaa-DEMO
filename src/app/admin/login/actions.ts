"use server";

import { createClient } from "@/lib/supabase/server";

export async function loginAction(
  email: string,
  password: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Admin Login] auth error:", error?.message ?? "no user");
    }
    return { error: "بيانات الدخول غير صحيحة أو غير مصرح لك بالدخول" };
  }

  // ADMIN_EMAIL check is server-side only — never sent to the browser.
  // Fail secure: if ADMIN_EMAIL is not configured, deny everyone.
  const allowedEmail = process.env.ADMIN_EMAIL;
  if (!allowedEmail) {
    await supabase.auth.signOut();
    return { error: "Admin access is not configured. Please contact the site owner." };
  }
  if (data.user.email !== allowedEmail) {
    await supabase.auth.signOut();
    if (process.env.NODE_ENV === "development") {
      console.warn("[Admin Login] Unauthorized email rejected");
    }
    return { error: "غير مصرح لك بالدخول" };
  }

  return { success: true };
}
