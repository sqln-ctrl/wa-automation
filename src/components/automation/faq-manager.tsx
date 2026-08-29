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

interface Faq {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  isActive: boolean;
}

const emptyForm = { question: "", answer: "", keywords: "", isActive: true };

export default function FaqManager({ faqs }: { faqs: Faq[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(faq: Faq) {
    setEditingId(faq.id);
    setForm({ question: faq.question, answer: faq.answer, keywords: faq.keywords.join(", "), isActive: faq.isActive });
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
      question: form.question,
      answer: form.answer,
      keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean),
      isActive: form.isActive,
    };
    try {
      const res = await fetch(editingId ? `/api/faqs/${editingId}` : "/api/faqs", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json())?.error || "Failed to save FAQ");
      cancelEdit();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save FAQ");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this FAQ?")) return;
    await fetch(`/api/faqs/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function toggleActive(faq: Faq) {
    await fetch(`/api/faqs/${faq.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !faq.isActive }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{editingId ? "Edit FAQ" : "Add a FAQ"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="faqQuestion">Question</Label>
              <Input
                id="faqQuestion"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="What are your business hours?"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faqAnswer">Answer</Label>
              <Textarea
                id="faqAnswer"
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                placeholder="We're open Monday to Saturday, 9 AM to 7 PM."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faqKeywords">Trigger keywords (comma-separated)</Label>
              <Input
                id="faqKeywords"
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                placeholder="hours, open, timing"
              />
              <p className="text-xs text-muted-foreground">
                If a customer's message contains any of these words, this answer is sent. Leave blank to match on the question text itself.
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update FAQ" : "Add FAQ"}
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
        {faqs.map((f) => (
          <Card key={f.id}>
            <CardContent className="space-y-1 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{f.question}</h3>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={f.isActive ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleActive(f)}
                  >
                    {f.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => startEdit(f)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(f.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{f.answer}</p>
              {f.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {f.keywords.map((k) => (
                    <Badge key={k} variant="outline">{k}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {faqs.length === 0 && <p className="text-sm text-muted-foreground">No FAQs added yet.</p>}
      </div>
    </div>
  );
}
