"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, X } from "lucide-react";

type TriggerType = "KEYWORD" | "GREETING" | "FALLBACK";

interface Rule {
  id: string;
  name: string;
  triggerType: TriggerType;
  keywords: string[];
  responseText: string;
  priority: number;
  isActive: boolean;
}

const emptyForm = { name: "", triggerType: "KEYWORD" as TriggerType, keywords: "", responseText: "", priority: "0", isActive: true };

const TRIGGER_HELP: Record<TriggerType, string> = {
  KEYWORD: "Fires when a customer's message contains any of the keywords below.",
  GREETING: "Fires on greeting words like 'hi' or 'hello' (only used if no FAQ/Settings welcome message matches first).",
  FALLBACK: "Fires when nothing else matches — your safety-net response. Only one active fallback rule is used at a time.",
};

export default function RulesManager({ rules }: { rules: Rule[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(r: Rule) {
    setEditingId(r.id);
    setForm({
      name: r.name,
      triggerType: r.triggerType,
      keywords: r.keywords.join(", "),
      responseText: r.responseText,
      priority: r.priority.toString(),
      isActive: r.isActive,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      name: form.name,
      triggerType: form.triggerType,
      keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean),
      responseText: form.responseText,
      priority: parseInt(form.priority, 10) || 0,
      isActive: form.isActive,
    };
    try {
      const res = await fetch(editingId ? `/api/automation-rules/${editingId}` : "/api/automation-rules", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json())?.error || "Failed to save rule");
      cancelEdit();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save rule");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this automation rule?")) return;
    await fetch(`/api/automation-rules/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function toggleActive(rule: Rule) {
    await fetch(`/api/automation-rules/${rule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !rule.isActive }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{editingId ? "Edit rule" : "Add an automation rule"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ruleName">Name</Label>
                <Input id="ruleName" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ruleType">Trigger type</Label>
                <select
                  id="ruleType"
                  value={form.triggerType}
                  onChange={(e) => setForm({ ...form, triggerType: e.target.value as TriggerType })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="KEYWORD">Keyword</option>
                  <option value="GREETING">Greeting</option>
                  <option value="FALLBACK">Fallback</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{TRIGGER_HELP[form.triggerType]}</p>

            {form.triggerType === "KEYWORD" && (
              <div className="space-y-2">
                <Label htmlFor="ruleKeywords">Keywords (comma-separated)</Label>
                <Input
                  id="ruleKeywords"
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  placeholder="price, cost, how much"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="ruleResponse">Response text</Label>
              <Textarea id="ruleResponse" value={form.responseText} onChange={(e) => setForm({ ...form, responseText: e.target.value })} required />
            </div>

            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="space-y-2">
                <Label htmlFor="rulePriority">Priority (higher checked first)</Label>
                <Input id="rulePriority" type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 text-sm pb-2">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update rule" : "Add rule"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  <X className="mr-1 h-3 w-3" /> Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {rules.map((r) => (
          <Card key={r.id}>
            <CardContent className="space-y-1 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{r.name}</h3>
                  <Badge variant="outline">{r.triggerType}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.isActive ? "default" : "secondary"} className="cursor-pointer" onClick={() => toggleActive(r)}>
                    {r.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => startEdit(r)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{r.responseText}</p>
              {r.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {r.keywords.map((k) => (
                    <Badge key={k} variant="outline">{k}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {rules.length === 0 && <p className="text-sm text-muted-foreground">No automation rules added yet.</p>}
      </div>
    </div>
  );
}
