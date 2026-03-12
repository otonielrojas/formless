import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { schema } = await request.json();
    if (!schema) return NextResponse.json({ error: "Schema is required" }, { status: 400 });

    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) return NextResponse.json({ error: "No workspace found" }, { status: 400 });

    const { data, error } = await supabase
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
