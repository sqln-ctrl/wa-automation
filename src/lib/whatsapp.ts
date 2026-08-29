// Dedicated WhatsApp Cloud API service.
// All credentials come from environment variables — never hardcode secrets here.
import type {
  OutgoingButtonMessage,
  OutgoingListMessage,
  OutgoingTemplateMessage,
  OutgoingTextMessage,
} from "@/types/whatsapp";

const API_VERSION = process.env.WHATSAPP_API_VERSION || "v20.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

function assertConfigured() {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    throw new Error(
      "WhatsApp is not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN."
    );
  }
}

async function callWhatsAppApi<T>(payload: unknown, endpoint = "messages"): Promise<T> {
  assertConfigured();

  const res = await fetch(`${BASE_URL}/${PHONE_NUMBER_ID}/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("[whatsapp] API error:", JSON.stringify(data));
    throw new Error(data?.error?.message || "WhatsApp API request failed");
  }

  return data as T;
}

export interface WhatsAppSendResult {
  messaging_product: "whatsapp";
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}

/** Sends a plain text message to a customer. */
export async function sendTextMessage(to: string, body: string): Promise<WhatsAppSendResult> {
  const payload: OutgoingTextMessage = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body, preview_url: false },
  };
  return callWhatsAppApi<WhatsAppSendResult>(payload);
}

/** Sends an interactive message with up to 3 quick-reply buttons. */
export async function sendButtonsMessage(
  to: string,
  bodyText: string,
  buttons: Array<{ id: string; title: string }>
): Promise<WhatsAppSendResult> {
  if (buttons.length > 3) {
    throw new Error("WhatsApp supports a maximum of 3 reply buttons per message.");
  }
  const payload: OutgoingButtonMessage = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: bodyText },
      action: {
        buttons: buttons.map((b) => ({ type: "reply", reply: { id: b.id, title: b.title } })),
      },
    },
  };
  return callWhatsAppApi<WhatsAppSendResult>(payload);
}

/** Sends an interactive list message (used for menus like services or FAQ topics). */
export async function sendListMessage(
  to: string,
  bodyText: string,
  buttonLabel: string,
  sections: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }>
): Promise<WhatsAppSendResult> {
  const payload: OutgoingListMessage = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: bodyText },
      action: { button: buttonLabel, sections },
    },
  };
  return callWhatsAppApi<WhatsAppSendResult>(payload);
}

/** Sends a pre-approved WhatsApp template message (required for messages outside the 24h window). */
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode = "en_US",
  parameters: string[] = []
): Promise<WhatsAppSendResult> {
  const payload: OutgoingTemplateMessage = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      ...(parameters.length
        ? { components: [{ type: "body", parameters: parameters.map((text) => ({ type: "text", text })) }] }
        : {}),
    },
  };
  return callWhatsAppApi<WhatsAppSendResult>(payload);
}

/** Marks an inbound message as read (shows blue ticks to the customer). */
export async function markMessageAsRead(messageId: string): Promise<void> {
  await callWhatsAppApi({
    messaging_product: "whatsapp",
    status: "read",
    message_id: messageId,
  });
}

/** Verifies the X-Hub-Signature-256 header on incoming webhooks using WHATSAPP_APP_SECRET. */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader || !process.env.WHATSAPP_APP_SECRET) return false;
  const crypto = require("crypto") as typeof import("crypto");
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", process.env.WHATSAPP_APP_SECRET).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}
