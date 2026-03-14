"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WebhookUrlForm({
  schemaId,
  initialUrl,
}: {
  schemaId: string;
  initialUrl: string | null;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/schemas/${schemaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhook_url: url }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Save failed");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save webhook URL");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <Input
        value={url}
        onChange={(e) => { setUrl(e.target.value); setSaved(false); }}
        placeholder="https://your-server.com/webhook"
        className="h-7 text-xs font-mono"
      />
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs shrink-0"
        onClick={handleSave}
        disabled={saving}
      >
        {saved ? "Saved!" : saving ? "Saving…" : "Save"}
      </Button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
