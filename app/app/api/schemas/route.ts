import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { schema } = await request.json();
    if (!schema) return NextResponse.json({ error: "Schema is required" }, { status: 400 });

    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let { data: membership } = await admin
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .single();

    // Create workspace on the fly if none exists
    if (!membership) {
      const slug = (user.email ?? "user").split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");
      const { data: workspace } = await admin
        .from("workspaces")
        .insert({ name: `${slug}'s Workspace`, slug: `${slug}-${Date.now()}` })
        .select()
        .single();

      if (!workspace) return NextResponse.json({ error: "Could not create workspace" }, { status: 500 });

      await admin.from("workspace_members").insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: "admin",
      });

      membership = { workspace_id: workspace.id };
    }

    const { data, error } = await admin
      .from("schemas")
      .insert({
        workspace_id: membership.workspace_id,
        name: schema.name,
        description: schema.description,
        definition: schema,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ schema: data });
  } catch (e) {
    console.error("Schema save error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}
