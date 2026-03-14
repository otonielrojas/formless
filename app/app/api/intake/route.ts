import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { z } from "zod";
import { extractFromInput } from "@/lib/ai/extract";
import { dispatchWebhook } from "@/lib/webhooks/dispatch";

// ─── Validation schemas ────────────────────────────────────────────────────────

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(2000),
});

const IntakeBodySchema = z.object({
  token: z.string().min(1),
  input: z.string().min(1).max(5000),
  conversationHistory: z.array(MessageSchema).max(20).default([]),
});

const RATE_LIMIT = 50;
const RATE_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = IntakeBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { token, input, conversationHistory } = parsed.data;

    // Service role: intake is unauthenticated, bypass RLS
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: schema, error: schemaError } = await supabase
      .from("schemas")
      .select("*")
      .eq("intake_token", token)
      .single();

    if (schemaError || !schema) {
      return NextResponse.json({ error: "Invalid intake link" }, { status: 404 });
    }

    // Rate limit: max 50 submissions per schema per hour
    const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    const { count: recentCount } = await supabase
      .from("records")
      .select("*", { count: "exact", head: true })
      .eq("schema_id", schema.id)
      .gte("created_at", since);

    if ((recentCount ?? 0) >= RATE_LIMIT) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const result = await extractFromInput(input, schema.definition, conversationHistory);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        clarificationQuestion: result.clarificationQuestion,
        missingFields: result.missingFields,
      });
    }

    // Save the record
    const { data: record, error: recordError } = await supabase
      .from("records")
      .insert({
        schema_id: schema.id,
        workspace_id: schema.workspace_id,
        raw_input: input,
        extracted_data: result.data,
        schema_version: schema.version,
      })
      .select()
      .single();

    if (recordError) throw recordError;

    // Fire webhook if configured (non-blocking on failure)
    if (schema.webhook_url) {
      dispatchWebhook(schema.webhook_url, schema.id, {
        event: "record.created",
        schema: { id: schema.id, name: schema.name, version: schema.version },
        record: {
          id: record.id,
          raw_input: record.raw_input,
          extracted_data: record.extracted_data,
          status: record.status,
          created_at: record.created_at,
        },
      }).catch(() => {/* logged inside dispatchWebhook */});
    }

    return NextResponse.json({ success: true, record });
  } catch (e) {
    console.error("Intake error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Intake failed" },
      { status: 500 }
    );
  }
}
