import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side guard for admin-only pages/layouts.
 * Redirects to /admin/login if the user is unauthenticated or not the admin.
 * Middleware is the first line of defense; this provides defense-in-depth.
 */
export async function requireAdmin(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const allowedEmail = process.env.ADMIN_EMAIL;
  // Fail secure: if ADMIN_EMAIL is not configured, deny everyone.
  if (!allowedEmail || user.email !== allowedEmail) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }
}
