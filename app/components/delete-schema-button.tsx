"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteSchemaButton({ schemaId }: { schemaId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/schemas/${schemaId}`, { method: "DELETE" });
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex gap-1">
        <Button size="sm" variant="destructive" onClick={handleDelete} disabled={loading}>
          {loading ? "Deleting…" : "Confirm"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} disabled={loading}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-600" onClick={() => setConfirming(true)}>
      Delete
    </Button>
  );
}
