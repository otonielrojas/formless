import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verifies that an incoming request was sent by Slack using the signing secret.
 * https://api.slack.com/authentication/verifying-requests-from-slack
 */
export function verifySlackSignature(
  headers: Headers,
  rawBody: string
): boolean {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) return false;

  const timestamp = headers.get("x-slack-request-timestamp");
  const signature = headers.get("x-slack-signature");
  if (!timestamp || !signature) return false;

  // Reject requests older than 5 minutes (replay attack protection)
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (age > 300) return false;

  const baseString = `v0:${timestamp}:${rawBody}`;
  const computed = `v0=${createHmac("sha256", signingSecret).update(baseString).digest("hex")}`;

  try {
    return timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
  } catch {
    return false;
  }
}

/**
 * Posts a message to a Slack channel using the bot token.
 */
export async function postSlackMessage(
  channel: string,
  text: string
): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error("SLACK_BOT_TOKEN not configured");

  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ channel, text }),
  });

  if (!res.ok) throw new Error(`Slack API HTTP error: ${res.status}`);

  const data = await res.json();
  if (!data.ok) throw new Error(`Slack API error: ${data.error}`);
}
