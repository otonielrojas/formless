import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// Block private/loopback ranges to prevent SSRF
const PRIVATE_IP_PATTERN =
  /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i;

function validateWebhookUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return "Webhook URL must use HTTPS";
    if (PRIVATE_IP_PATTERN.test(url.hostname)) return "Webhook URL must be a public host";
    return null;
  } catch {
    return "Webhook URL is not a valid URL";
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { webhook_url, slack_channel_id } = body;

    if (webhook_url) {
      const urlError = validateWebhookUrl(webhook_url);
      if (urlError) return NextResponse.json({ error: urlError }, { status: 400 });
    }

    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: membership } = await admin
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const updates: Record<string, string | null> = {};
    if ("webhook_url" in body) updates.webhook_url = webhook_url || null;
    if ("slack_channel_id" in body) updates.slack_channel_id = slack_channel_id || null;

    const { error } = await admin
      .from("schemas")
      .update(updates)
      .eq("id", params.id)
      .eq("workspace_id", membership.workspace_id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Update failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify the schema belongs to the user's workspace
    const { data: membership } = await admin
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await admin
      .from("schemas")
      .delete()
      .eq("id", params.id)
      .eq("workspace_id", membership.workspace_id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Delete failed" },
      { status: 500 }
    );
  }
}
