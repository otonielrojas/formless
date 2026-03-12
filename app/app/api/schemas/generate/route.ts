import { NextRequest, NextResponse } from "next/server";
import { generateSchemaFromDescription } from "@/lib/ai/extract";

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();
    if (!description?.trim()) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }
    const schema = await generateSchemaFromDescription(description);
    return NextResponse.json({ schema });
  } catch (e) {
    console.error("Schema generation error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Generation failed" },
      { status: 500 }
    );
  }
}
