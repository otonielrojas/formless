"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

async function ensureWorkspace(userId: string, email: string) {
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: existing } = await admin
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId)
    .single();

  if (existing) return;

  const slug = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");
  const { data: workspace } = await admin
    .from("workspaces")
    .insert({ name: `${slug}'s Workspace`, slug: `${slug}-${Date.now()}` })
    .select()
    .single();

  if (workspace) {
    await admin.from("workspace_members").insert({
      workspace_id: workspace.id,
      user_id: userId,
      role: "admin",
    });
  }
}

export async function login(formData: FormData) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) redirect("/login?error=Invalid+credentials");

  // Create workspace if this is the first login and none exists yet
  await ensureWorkspace(data.user.id, data.user.email!);

  revalidatePath("/", "layout");
  redirect("/schemas");
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  const email = (formData.get("email") as string).toLowerCase().trim();
  const password = formData.get("password") as string;
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Invite-only: check against ALLOWED_SIGNUP_EMAILS env var (comma-separated)
  const allowlist = (process.env.ALLOWED_SIGNUP_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (allowlist.length > 0 && !allowlist.includes(email)) {
    redirect("/signup?error=This+email+is+not+on+the+invite+list");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) redirect("/signup?error=Sign+up+failed.+Password+must+be+at+least+6+characters");

  revalidatePath("/", "layout");
  redirect("/login?message=Check+your+email+to+confirm+your+account");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut({ scope: "global" }); // invalidate all devices
  redirect("/login");
}
