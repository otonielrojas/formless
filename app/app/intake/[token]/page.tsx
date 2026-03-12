"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Message = { role: "user" | "assistant"; content: string };
type Step = "input" | "clarifying" | "done" | "error";

export default function IntakePage({ params }: { params: { token: string } }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [clarification, setClarification] = useState("");

  async function handleSubmit(text: string, history: Message[]) {
    setLoading(true);
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: params.token,
          input: text,
          conversationHistory: history,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStep("error");
        return;
      }

      if (data.success) {
        setStep("done");
      } else {
        setClarification(data.clarificationQuestion);
        setStep("clarifying");
      }
    } catch {
      setStep("error");
    } finally {
      setLoading(false);
    }
  }

  function handleFirstSubmit() {
    if (!input.trim()) return;
    const userMessage: Message = { role: "user", content: input };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");
    handleSubmit(input, []);
  }

  function handleClarificationSubmit() {
    if (!input.trim()) return;
    const assistantMessage: Message = { role: "assistant", content: clarification };
    // historyForApi stops before the user's answer — extractFromInput appends input itself
    const historyForApi = [...messages, assistantMessage];
    // displayHistory includes the answer for the UI
    const displayHistory = [...historyForApi, { role: "user" as const, content: input }];
    setMessages(displayHistory);
    setInput("");
    setClarification("");
    setStep("input");
    handleSubmit(input, historyForApi);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Submit a request</h1>
          <p className="text-sm text-gray-500 mt-1">
            Just describe what you need — no forms to fill out.
          </p>
        </div>

        {/* Conversation history */}
        {messages.length > 0 && (
          <div className="space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-gray-900 text-white"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {step === "clarifying" && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm bg-white border border-gray-200 text-gray-800">
                  {clarification}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Done state */}
        {step === "done" && (
          <div className="bg-white border border-green-200 rounded-xl p-6 text-center space-y-2">
            <div className="text-2xl">✓</div>
            <p className="font-semibold text-gray-900">Request received</p>
            <p className="text-sm text-gray-500">
              Your request has been captured and submitted. Someone will follow up with you.
            </p>
          </div>
        )}

        {/* Error state */}
        {step === "error" && (
          <div className="bg-white border border-red-200 rounded-xl p-6 text-center space-y-2">
            <p className="font-semibold text-gray-900">Something went wrong</p>
            <p className="text-sm text-gray-500">Please try again or contact support.</p>
            <Button variant="outline" onClick={() => setStep("input")}>Try again</Button>
          </div>
        )}

        {/* Input */}
        {(step === "input" || step === "clarifying") && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                step === "input"
                  ? "Describe your request in plain English…"
                  : "Type your answer…"
              }
              className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  step === "input" ? handleFirstSubmit() : handleClarificationSubmit();
                }
              }}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">⌘↵ to submit</span>
              <Button
                size="sm"
                onClick={step === "input" ? handleFirstSubmit : handleClarificationSubmit}
                disabled={loading || !input.trim()}
              >
                {loading ? "Processing…" : "Submit"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
