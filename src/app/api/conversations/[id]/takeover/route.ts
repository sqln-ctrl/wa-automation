import { NextRequest, NextResponse } from "next/server";
import { takeOverConversation, returnToBot } from "@/services/conversation.service";

/** POST -> hand the conversation to a human. DELETE -> return control to the bot. */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const conversation = await takeOverConversation(params.id);
  return NextResponse.json(conversation);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const conversation = await returnToBot(params.id);
  return NextResponse.json(conversation);
}
