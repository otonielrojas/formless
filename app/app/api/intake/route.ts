import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractFromInput } from "@/lib/ai/extract";

export async function POST(request: NextRequest) {
  try {
    const { token, input, conversationHistory } = await request.json();
    if (!token || !input?.trim()) {
      return NextResponse.json({ error: "Token and input are required" }, { status: 400 });
    }

    // Use service role to allow unauthenticated intake submissions
    const supabase = createClient();

    const { data: schema, error: schemaError } = await supabase
      .from("schemas")
      .select("*")
      .eq("intake_token", token)
      .single();

    if (schemaError || !schema) {
      return NextResponse.json({ error: "Invalid intake link" }, { status: 404 });
    }

    const result = await extractFromInput(input, schema.definition, conversationHistory ?? []);

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

    return NextResponse.json({ success: true, record });
  } catch (e) {
    console.error("Intake error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Intake failed" },
      { status: 500 }
    );
  }
}
