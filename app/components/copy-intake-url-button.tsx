"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyIntakeUrlButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url = `${window.location.origin}/intake/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? "Copied!" : "Copy URL"}
    </Button>
  );
}
