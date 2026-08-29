"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface Settings {
  businessName: string;
  welcomeMessage: string | null;
  aiEnabled: boolean;
  aiSystemPrompt: string | null;
  handoffKeywords: string[];
}

export default function SettingsForm({ settings }: { settings: Settings | null }) {
  const [businessName, setBusinessName] = useState(settings?.businessName ?? "My Business");
  const [welcomeMessage, setWelcomeMessage] = useState(settings?.welcomeMessage ?? "");
  const [aiEnabled, setAiEnabled] = useState(settings?.aiEnabled ?? false);
  const [aiSystemPrompt, setAiSystemPrompt] = useState(settings?.aiSystemPrompt ?? "");
  const [handoffKeywords, setHandoffKeywords] = useState((settings?.handoffKeywords ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          welcomeMessage,
          aiEnabled,
          aiSystemPrompt,
          handoffKeywords: handoffKeywords.split(",").map((k) => k.trim()).filter(Boolean),
        }),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business name</Label>
          <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="welcomeMessage">Welcome message</Label>
          <Textarea id="welcomeMessage" value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="handoffKeywords">Human handoff keywords (comma-separated)</Label>
          <Input id="handoffKeywords" value={handoffKeywords} onChange={(e) => setHandoffKeywords(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="aiEnabled"
            type="checkbox"
            checked={aiEnabled}
            onChange={(e) => setAiEnabled(e.target.checked)}
            className="h-4 w-4"
          />
          <Label htmlFor="aiEnabled">Enable AI fallback responses</Label>
        </div>
        {aiEnabled && (
          <div className="space-y-2">
            <Label htmlFor="aiSystemPrompt">AI system prompt</Label>
            <Textarea id="aiSystemPrompt" rows={4} value={aiSystemPrompt} onChange={(e) => setAiSystemPrompt(e.target.value)} />
          </div>
        )}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save settings"}
          </Button>
          {saved && <span className="text-sm text-muted-foreground">Saved.</span>}
        </div>
      </CardContent>
    </Card>
  );
}
