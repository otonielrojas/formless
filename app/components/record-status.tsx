"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "open" | "in_progress" | "resolved";

const statusStyles: Record<Status, string> = {
  open: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-yellow-50 text-yellow-700 border-yellow-200",
  resolved: "bg-green-50 text-green-700 border-green-200",
};

const statusLabels: Record<Status, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const next: Record<Status, Status> = {
  open: "in_progress",
  in_progress: "resolved",
  resolved: "open",
};

export function RecordStatus({ recordId, status }: { recordId: string; status: Status }) {
  const router = useRouter();
  const [current, setCurrent] = useState<Status>(status);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const newStatus = next[current];
    setLoading(true);
    setCurrent(newStatus); // optimistic
    try {
      await fetch(`/api/records/${recordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } catch {
      setCurrent(current); // revert on error
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title="Click to advance status"
      className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-opacity cursor-pointer hover:opacity-70 ${statusStyles[current]}`}
    >
      {statusLabels[current]}
    </button>
  );
}
