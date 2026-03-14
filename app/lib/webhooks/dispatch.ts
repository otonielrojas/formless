import { createClient as createServiceClient } from "@supabase/supabase-js";

interface WebhookPayload {
  event: "record.created";
  schema: {
    id: string;
    name: string;
    version: number;
  };
  record: {
    id: string;
    raw_input: string;
    extracted_data: Record<string, unknown>;
    status: string;
    created_at: string;
  };
}

const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [0, 1000, 2000];

export async function dispatchWebhook(
  webhookUrl: string,
  schemaId: string,
  payload: WebhookPayload
): Promise<void> {
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let lastError: string | undefined;
  let lastHttpStatus: number | undefined;
  let succeeded = false;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (RETRY_DELAYS_MS[attempt - 1] > 0) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt - 1]));
    }

    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });

      lastHttpStatus = res.status;

      if (res.ok) {
        succeeded = true;
        await supabase.from("webhook_deliveries").insert({
          schema_id: schemaId,
          record_id: payload.record.id,
          webhook_url: webhookUrl,
          status: "success",
          http_status: res.status,
          attempts: attempt,
        });
        return;
      }

      lastError = `HTTP ${res.status}`;
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }

  if (!succeeded) {
    await supabase.from("webhook_deliveries").insert({
      schema_id: schemaId,
      record_id: payload.record.id,
      webhook_url: webhookUrl,
      status: "failed",
      http_status: lastHttpStatus ?? null,
      attempts: MAX_ATTEMPTS,
      error: lastError,
    });
  }
}
