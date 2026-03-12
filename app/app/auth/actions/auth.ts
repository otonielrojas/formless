"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) redirect("/login?error=Invalid+credentials");

  revalidatePath("/", "layout");
  redirect("/schemas");
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) redirect("/login?error=Sign+up+failed");

  const userId = authData.user?.id;
  if (!userId) redirect("/login?error=Sign+up+failed");

  // Create a workspace for the new user
  const slug = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");

  const { data: workspace, error: wsError } = await supabase
    .from("workspaces")
    .insert({ name: `${email.split("@")[0]}'s Workspace`, slug: `${slug}-${Date.now()}` })
    .select()
    .single();

  if (wsError || !workspace) redirect("/login?error=Workspace+creation+failed");

  await supabase.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: userId,
    role: "admin",
  });

  revalidatePath("/", "layout");
  redirect("/schemas");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
