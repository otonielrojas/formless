import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { SchemaDefinition, ExtractionResult } from "@/types/schema";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Schema builder ───────────────────────────────────────────────────────────

/**
 * Takes a plain English description from an admin and generates a structured
 * schema definition (field names, types, required flags, enum values).
 */
export async function generateSchemaFromDescription(
  description: string
): Promise<SchemaDefinition> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a schema designer for a form replacement system.
An admin has described what data they need to capture. Generate a structured schema definition.

Admin description: "${description}"

Return ONLY a valid JSON object with this exact structure:
{
  "name": "Human-readable name for this schema",
  "description": "One sentence describing what this schema captures",
  "fields": [
    {
      "name": "snake_case_field_name",
      "label": "Human Readable Label",
      "type": "string|text|number|boolean|enum|date",
      "required": true|false,
      "description": "What this field captures (used in extraction prompt)",
      "values": ["only", "for", "enum", "fields"]
    }
  ]
}

Rules:
- Use "string" for short text (names, titles, systems)
- Use "text" for long descriptions or body content
- Use "enum" when values are constrained to a known list
- Always include a clear "description" for each field — it guides the AI extraction
- Return ONLY the JSON, no markdown, no explanation`,
      },
    ],
  });

  const raw = (message.content[0] as { type: string; text: string }).text.trim();
  const parsed = JSON.parse(raw);

  // Validate the structure before returning
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
Your job is to extract structured data from natural language input.

Schema fields to extract:
${fieldDescriptions}

Rules:
1. Extract values from the user's input as accurately as possible
2. For missing REQUIRED fields, use the string "__MISSING__"
3. For missing optional fields, use null
4. For enum fields, map the user's words to the closest valid value
5. Return ONLY valid JSON with the extracted field values
6. Do not invent or assume values that aren't clearly stated

Return this exact JSON structure:
{
  "extracted": { "field_name": "value_or___MISSING___or_null" },
  "confidence": { "field_name": 0.0-1.0 }
}`;

  const messages: Array<{ role: "user" | "assistant"; content: string }> = [
    ...conversationHistory,
    { role: "user", content: input },
  ];

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const raw = (response.content[0] as { type: string; text: string }).text.trim();
  const parsed = JSON.parse(raw);
  const extracted: Record<string, unknown> = parsed.extracted;

  // Find missing required fields
  const missingFields = schema.fields
    .filter((f) => f.required && extracted[f.name] === "__MISSING__")
    .map((f) => f.name);

  if (missingFields.length === 0) {
    // Clean up __MISSING__ sentinels (shouldn't exist, but be safe)
    const cleanData: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(extracted)) {
      cleanData[k] = v === "__MISSING__" ? null : v;
    }
    return { success: true, data: cleanData };
  }

  // Generate a single natural follow-up question for the missing fields
  const missingLabels = missingFields.map(
    (name) => schema.fields.find((f) => f.name === name)?.label ?? name
  );

  const clarifyResponse = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `A user submitted a "${schema.name}" request but we're missing: ${missingLabels.join(", ")}.
Their original message: "${input}"
Generate ONE natural, friendly follow-up question to get this missing information.
Be conversational. Return ONLY the question, no explanation.`,
      },
    ],
  });

  const clarificationQuestion = (
    clarifyResponse.content[0] as { type: string; text: string }
  ).text.trim();

  return {
    success: false,
    missingFields,
    clarificationQuestion,
  };
}
