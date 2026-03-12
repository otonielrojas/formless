"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { SchemaDefinition } from "@/types/schema";

type Step = "describe" | "preview" | "saving";

export default function NewSchemaPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("describe");
  const [description, setDescription] = useState("");
  const [schema, setSchema] = useState<SchemaDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!description.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/schemas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setSchema(data.schema);
      setStep("preview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!schema) return;
    setStep("saving");
    try {
      const res = await fetch("/api/schemas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      router.push("/schemas");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStep("preview");
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Schema</h1>
        <p className="text-sm text-gray-500 mt-1">
          Describe what data you need to capture — in plain English.
        </p>
      </div>

      {step === "describe" && (
        <div className="space-y-4">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`Examples:\n• "IT support tickets with a title, description, category (hardware/software/network/access), priority, and affected system"\n• "HR onboarding requests with employee name, start date, department, manager name, and equipment needed"\n• "Procurement requests with item name, quantity, estimated cost, vendor, and business justification"`}
            className="min-h-[180px] text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button onClick={handleGenerate} disabled={loading || !description.trim()}>
            {loading ? "Generating schema…" : "Generate Schema"}
          </Button>
        </div>
      )}

      {(step === "preview" || step === "saving") && schema && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-gray-900 text-lg">{schema.name}</h2>
              <p className="text-sm text-gray-500">{schema.description}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Fields</p>
              {schema.fields.map((field) => (
                <div
                  key={field.name}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900">{field.label}</span>
                      <Badge variant="outline" className="text-xs">{field.type}</Badge>
                      {field.required && (
                        <Badge variant="secondary" className="text-xs">required</Badge>
                      )}
                    </div>
                    {field.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{field.description}</p>
                    )}
                    {field.values && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Options: {field.values.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={step === "saving"}>
              {step === "saving" ? "Saving…" : "Save Schema"}
            </Button>
            <Button
              variant="outline"
              onClick={() => { setStep("describe"); setSchema(null); }}
              disabled={step === "saving"}
            >
              Start over
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
