import { z } from "zod";

// ─── Field definition ─────────────────────────────────────────────────────────

export const FieldTypeSchema = z.enum([
  "string",
  "text",       // long-form string
  "number",
  "boolean",
  "enum",
  "date",
]);

export type FieldType = z.infer<typeof FieldTypeSchema>;

export const FieldDefinitionSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: FieldTypeSchema,
  required: z.boolean().default(true),
  description: z.string().optional(),
  values: z.array(z.string()).optional(), // for enum fields
});

export type FieldDefinition = z.infer<typeof FieldDefinitionSchema>;

// ─── Schema definition ────────────────────────────────────────────────────────

export const SchemaDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  fields: z.array(FieldDefinitionSchema).min(1),
});

export type SchemaDefinition = z.infer<typeof SchemaDefinitionSchema>;

// ─── DB row types ─────────────────────────────────────────────────────────────

export interface FormlessSchema {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  definition: SchemaDefinition;
  intake_token: string;
  version: number;
  webhook_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FormlessRecord {
  id: string;
  schema_id: string;
  workspace_id: string;
  raw_input: string;
  extracted_data: Record<string, unknown>;
  schema_version: number;
  status: "open" | "in_progress" | "resolved";
  created_at: string;
  updated_at: string;
}

// ─── AI extraction result ─────────────────────────────────────────────────────

export const ExtractionResultSchema = z.object({
  success: z.boolean(),
  data: z.record(z.unknown()).optional(),
  missingFields: z.array(z.string()).optional(),
  clarificationQuestion: z.string().optional(),
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;
