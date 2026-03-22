import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { verifySlackSignature, postSlackMessage } from "@/lib/slack/client";
import { extractFromInput } from "@/lib/ai/extract";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // Verify the request came from Slack
  if (!verifySlackSignature(request.headers, rawBody)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);

  // Slack sends this once when you first configure the Events API endpoint
  if (body.type === "url_verification") {
    return NextResponse.json({ challenge: body.challenge });
  }

  // Only process message events
  if (body.type !== "event_callback" || body.event?.type !== "message") {
    return NextResponse.json({ ok: true });
  }

  const event = body.event;

  // Skip bot messages and message subtypes (edits, deletes) to avoid loops
  if (event.bot_id || event.subtype) {
    return NextResponse.json({ ok: true });
  }

  const channelId = event.channel as string;
  const text = (event.text as string)?.trim();

  if (!channelId || !text) {
    return NextResponse.json({ ok: true });
  }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find the schema linked to this channel
  const { data: schema } = await supabase
    .from("schemas")
    .select("*")
    .eq("slack_channel_id", channelId)
    .single();

  // Channel not linked to any schema — silently ignore
  if (!schema) {
    return NextResponse.json({ ok: true });
  }

  try {
    const result = await extractFromInput(text, schema.definition);

    if (result.success && result.data) {
      // Save the record
      const { error: recordError } = await supabase
        .from("records")
        .insert({
          schema_id: schema.id,
          workspace_id: schema.workspace_id,
          raw_input: text,
          extracted_data: result.data,
          schema_version: schema.version,
        });

      if (recordError) throw recordError;

      // Build human-readable summary
      const summary = Object.entries(result.data)
        .filter(([, v]) => v !== null)
        .map(([k, v]) => `• *${k}*: ${v}`)
        .join("\n");

      await postSlackMessage(
        channelId,
        `:white_check_mark: *Got it!* Here's what I captured:\n${summary}\n\n_Record saved. View it in Formless._`
      );
    } else {
      // Missing required fields — ask for clarification
      await postSlackMessage(
        channelId,
        `:thinking_face: ${result.clarificationQuestion}`
      );
    }
  } catch (e) {
    console.error("Slack intake error:", e);
    await postSlackMessage(
      channelId,
      `:x: Sorry, something went wrong processing your request. Please try again.`
    );
  }

  return NextResponse.json({ ok: true });
}
