// Optional AI Response Engine — uses any OpenAI-compatible provider.
// If AI_ENABLED is false or no API key is set, callers should fall back to rule-based responses.
import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!process.env.AI_PROVIDER_API_KEY) return null;
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.AI_PROVIDER_API_KEY,
      baseURL: process.env.AI_PROVIDER_BASE_URL || "https://api.openai.com/v1",
    });
  }
  return client;
}

export function isAiEnabled(): boolean {
  return process.env.AI_ENABLED === "true" && !!process.env.AI_PROVIDER_API_KEY;
}

export interface AiChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Generates an AI reply given conversation history and a system prompt describing
 * the business (services, FAQs, tone). Returns null on failure so the caller can
 * fall back to a rule-based or handoff response instead of erroring out to the customer.
 */
export async function generateAiReply(
  messages: AiChatMessage[],
  systemPrompt: string
): Promise<string | null> {
  const openai = getClient();
  if (!openai) return null;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.4,
      max_tokens: 400,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error("[ai] generateAiReply failed:", err);
    return null;
  }
}

/** Builds the default system prompt from business settings, services, and FAQs. */
export function buildSystemPrompt(opts: {
  businessName: string;
  services: Array<{ name: string; description?: string | null; price?: string | null }>;
  faqs: Array<{ question: string; answer: string }>;
  customPrompt?: string | null;
}): string {
  const serviceList = opts.services
    .map((s) => `- ${s.name}${s.price ? ` (${s.price})` : ""}${s.description ? `: ${s.description}` : ""}`)
    .join("\n");
  const faqList = opts.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");

  return [
    opts.customPrompt || `You are a helpful WhatsApp assistant for ${opts.businessName}.`,
    "Answer customer questions clearly and briefly, in a friendly, professional tone.",
    "Only answer using the information provided below. If you don't know something, say you'll connect them with a team member.",
    serviceList ? `\nServices:\n${serviceList}` : "",
    faqList ? `\nFAQs:\n${faqList}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
