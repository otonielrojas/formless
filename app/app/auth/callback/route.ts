import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) return NextResponse.redirect(`${origin}/login?error=Missing+code`);

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(`${origin}/login?error=Auth+failed`);

  const user = data.user;

  // Check if workspace already exists for this user
  const { data: existing } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    // Create workspace using service role to bypass RLS
    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const slug = (user.email ?? "user").split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");

    const { data: workspace } = await admin
      .from("workspaces")
      .insert({ name: `${slug}'s Workspace`, slug: `${slug}-${Date.now()}` })
      .select()
      .single();

    if (workspace) {
      await admin.from("workspace_members").insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: "admin",
      });
    }
  }

  return NextResponse.redirect(`${origin}/schemas`);
}
