import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock Supabase ─────────────────────────────────────────────────────────────
const mockInsert = vi.fn().mockResolvedValue({ error: null });
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({ insert: mockInsert }),
  }),
}));

// Import after mocks are set up
import { dispatchWebhook } from "./dispatch";

const SCHEMA_ID = "schema-123";
const RECORD_ID = "record-456";

const payload = {
  event: "record.created" as const,
  schema: { id: SCHEMA_ID, name: "Test Schema", version: 1 },
  record: {
    id: RECORD_ID,
    raw_input: "I need a laptop",
    extracted_data: { item: "laptop" },
    status: "open",
    created_at: new Date().toISOString(),
  },
};

function makeResponse(status: number): Response {
  return new Response(null, { status });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("dispatchWebhook", () => {
  it("succeeds on first attempt and logs success", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce(makeResponse(200));

    await dispatchWebhook("https://example.com/hook", SCHEMA_ID, payload);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ status: "success", attempts: 1, http_status: 200 })
    );
  });

  it("retries on non-2xx and logs failure after 3 attempts", async () => {
    global.fetch = vi.fn().mockResolvedValue(makeResponse(500));

    await dispatchWebhook("https://example.com/hook", SCHEMA_ID, payload);

    expect(fetch).toHaveBeenCalledTimes(3);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ status: "failed", attempts: 3, http_status: 500 })
    );
  });

  it("succeeds on second attempt after one 500", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(makeResponse(500))
      .mockResolvedValueOnce(makeResponse(200));

    await dispatchWebhook("https://example.com/hook", SCHEMA_ID, payload);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ status: "success", attempts: 2 })
    );
  });

  it("handles network errors and retries", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));

    await dispatchWebhook("https://example.com/hook", SCHEMA_ID, payload);

    expect(fetch).toHaveBeenCalledTimes(3);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "failed",
        error: "ECONNREFUSED",
        attempts: 3,
      })
    );
  });

  it("includes schema_id and record_id in the delivery log", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce(makeResponse(200));

    await dispatchWebhook("https://example.com/hook", SCHEMA_ID, payload);

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ schema_id: SCHEMA_ID, record_id: RECORD_ID })
    );
  });

  it("sends correct JSON body to the webhook", async () => {
    let capturedBody: unknown;
    global.fetch = vi.fn().mockImplementationOnce((_url, init) => {
      capturedBody = JSON.parse(init?.body as string);
      return Promise.resolve(makeResponse(200));
    });

    await dispatchWebhook("https://example.com/hook", SCHEMA_ID, payload);

    expect(capturedBody).toMatchObject({
      event: "record.created",
      schema: { id: SCHEMA_ID, name: "Test Schema" },
      record: { id: RECORD_ID },
    });
  });
});
