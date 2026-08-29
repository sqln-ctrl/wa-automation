import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getConversationWithMessages } from "@/services/conversation.service";
import { sendManualReply } from "@/services/whatsapp.service";

const bodySchema = z.object({ text: z.string().min(1) });

/** Lets a human agent send a manual message from the dashboard. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const conversation = await getConversationWithMessages(params.id);
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const message = await sendManualReply(conversation.id, conversation.customer.waId, parsed.data.text);
  return NextResponse.json(message);
}
