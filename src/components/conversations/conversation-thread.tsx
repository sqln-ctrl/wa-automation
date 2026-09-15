"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Bot, Send } from "lucide-react";

interface Props {
  conversation: {
    id: string;
    status: string;
    customer: { name: string | null; profileName: string | null; waId: string };
    messages: Array<{ id: string; direction: string; content: string; createdAt: Date; isFromBot: boolean }>;
  };
}

export default function ConversationThread({ conversation }: Props) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function sendReply() {
    if (!text.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/conversations/${conversation.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      setText("");
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  async function toggleTakeover() {
    await fetch(`/api/conversations/${conversation.id}/takeover`, {
      method: conversation.status === "HUMAN" ? "DELETE" : "POST",
    });
    router.refresh();
  }

  return (
    <div className="flex h-[calc(100vh-9rem)] min-h-[560px] flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_16px_40px_-28px_rgba(33,38,94,0.35)]">
      <div className="flex items-center justify-between border-b border-border/70 bg-gradient-to-r from-card to-accent/30 px-5 py-4">
        <div>
          <p className="page-kicker">Live conversation</p>
          <h1 className="mt-1 text-xl font-semibold tracking-[-0.025em]">
            {conversation.customer.name || conversation.customer.profileName || conversation.customer.waId}
          </h1>
          <p className="text-sm text-muted-foreground">{conversation.customer.waId}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={conversation.status === "HUMAN" ? "destructive" : "default"}>{conversation.status}</Badge>
          <Button variant="outline" size="sm" onClick={toggleTakeover}>
            {conversation.status === "HUMAN" ? "Return to bot" : "Take over"}
          </Button>
        </div>
      </div>

      <div className="subtle-grid flex-1 space-y-4 overflow-y-auto p-5">
        {conversation.messages.map((m) => (
          <div key={m.id} className={cn("flex", m.direction === "INBOUND" ? "justify-start" : "justify-end")}>
            <div
              className={cn(
                "max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                m.direction === "INBOUND" ? "rounded-tl-sm bg-card" : m.isFromBot ? "rounded-tr-sm border border-primary/10 bg-primary/10 text-primary" : "rounded-tr-sm bg-primary text-primary-foreground"
              )}
            >
              <p>{m.content}</p>
              <p className="mt-1.5 text-[10px] opacity-70">{m.isFromBot && <Bot className="mr-1 inline h-3 w-3" />}{new Date(m.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 border-t border-border/70 bg-card p-4">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a reply..."
          onKeyDown={(e) => e.key === "Enter" && sendReply()}
        />
        <Button onClick={sendReply} disabled={sending} className="shrink-0">
          <Send className="mr-2 h-4 w-4" /> Send
        </Button>
      </div>
    </div>
  );
}
