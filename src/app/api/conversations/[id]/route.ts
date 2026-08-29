import { NextRequest, NextResponse } from "next/server";
import { getConversationWithMessages, closeConversation } from "@/services/conversation.service";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const conversation = await getConversationWithMessages(params.id);
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(conversation);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const conversation = await closeConversation(params.id);
  return NextResponse.json(conversation);
}
