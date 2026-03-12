import Groq from "groq-sdk";
import { z } from "zod";
import type { SchemaDefinition, ExtractionResult } from "@/types/schema";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Best free Groq model for structured JSON tasks — swap to claude-sonnet-4-6 later
const MODEL = "llama-3.3-70b-versatile";

// ─── Schema builder ───────────────────────────────────────────────────────────

/**
 * Takes a plain English description from an admin and generates a structured
 * schema definition (field names, types, required flags, enum values).
 */
export async function generateSchemaFromDescription(
  description: string
): Promise<SchemaDefinition> {
  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 1024,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a schema designer for a form replacement system.
Return ONLY valid JSON — no markdown, no explanation.`,
      },
      {
        role: "user",
        content: `An admin has described what data they need to capture. Generate a structured schema definition.

Admin description: "${description}"

Return a JSON object with this exact structure:
{
  "name": "Human-readable name for this schema",
  "description": "One sentence describing what this schema captures",
  "fields": [
    {
      "name": "snake_case_field_name",
      "label": "Human Readable Label",
      "type": "string|text|number|boolean|enum|date",
      "required": true,
      "description": "What this field captures",
      "values": ["only", "for", "enum", "fields"]
    }
  ]
}

Rules:
- Use "string" for short text (names, titles, systems)
- Use "text" for long descriptions or body content
- Use "enum" when values are constrained to a known list
- Omit "values" for non-enum fields
- Always include a clear "description" per field — it guides AI extraction`,
      },
    ],
  });

  const raw = response.choices[0].message.content ?? "";
  const parsed = JSON.parse(raw);

  const SchemaDefinitionSchema = z.object({
    name: z.string(),
    description: z.string(),
    fields: z.array(
      z.object({
        name: z.string(),
        label: z.string(),
        type: z.enum(["string", "text", "number", "boolean", "enum", "date"]),
        required: z.boolean(),
        description: z.string().optional(),
        values: z.array(z.string()).optional(),
      })
    ),
  });

  return SchemaDefinitionSchema.parse(parsed);
}

// ─── Intake extractor ─────────────────────────────────────────────────────────

/**
 * Takes natural language input and a schema definition, extracts field values,
 * and returns either a complete record or a clarification question.
 */
export async function extractFromInput(
  input: string,
  schema: SchemaDefinition,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<ExtractionResult> {
  const fieldDescriptions = schema.fields
    .map((f) => {
      const enumNote = f.values ? ` (must be one of: ${f.values.join(", ")})` : "";
      const requiredNote = f.required ? " [REQUIRED]" : " [optional]";
      return `- ${f.name} (${f.type})${requiredNote}: ${f.description || f.label}${enumNote}`;
    })
    .join("\n");

  const systemPrompt = `You are an intelligent intake processor for a "${schema.name}" form.
Extract structured data from natural language input. Return ONLY valid JSON — no markdown.

Fields to extract:
${fieldDescriptions}

Rules:
- For missing REQUIRED fields use "__MISSING__"
- For missing optional fields use null
- For enum fields map the user's words to the closest valid value
- Do not invent values not clearly stated

Return:
{
  "extracted": { "field_name": "value or __MISSING__ or null" },
  "confidence": { "field_name": 0.95 }
}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 1024,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: input },
    ],
  });

  const raw = response.choices[0].message.content ?? "";
  const parsed = JSON.parse(raw);
  const extracted: Record<string, unknown> = parsed.extracted;

  // Find missing required fields
  const missingFields = schema.fields
    .filter((f) => f.required && extracted[f.name] === "__MISSING__")
    .map((f) => f.name);

  if (missingFields.length === 0) {
    const cleanData: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(extracted)) {
      cleanData[k] = v === "__MISSING__" ? null : v;
    }
    return { success: true, data: cleanData };
  }

  // Generate one natural follow-up question for missing fields
  const missingLabels = missingFields.map(
    (name) => schema.fields.find((f) => f.name === name)?.label ?? name
  );

  const clarifyResponse = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `A user submitted a "${schema.name}" request but we're missing: ${missingLabels.join(", ")}.
Their message: "${input}"
Generate ONE natural, friendly follow-up question to get this information.
Return ONLY the question — no explanation, no JSON.`,
      },
    ],
  });

  const clarificationQuestion =
    clarifyResponse.choices[0].message.content?.trim() ?? "";

  return { success: false, missingFields, clarificationQuestion };
}
