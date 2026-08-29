"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Pencil, Trash2, X } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  durationMin: number | null;
  isActive: boolean;
  isBookable: boolean;
}

const emptyForm = { name: "", description: "", price: "", durationMin: "", isActive: true, isBookable: false };

export default function ServiceManager({ services }: { services: Service[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(s: Service) {
    setEditingId(s.id);
    setForm({
      name: s.name,
      description: s.description ?? "",
      price: s.price ?? "",
      durationMin: s.durationMin?.toString() ?? "",
      isActive: s.isActive,
      isBookable: s.isBookable,
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
      description: form.description || undefined,
      price: form.price ? parseFloat(form.price) : undefined,
      durationMin: form.durationMin ? parseInt(form.durationMin, 10) : undefined,
      isActive: form.isActive,
      isBookable: form.isBookable,
    };
    try {
      const res = await fetch(editingId ? `/api/services/${editingId}` : "/api/services", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json())?.error || "Failed to save service");
      cancelEdit();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save service");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service?")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{editingId ? "Edit service" : "Add a service"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="svcName">Name</Label>
              <Input id="svcName" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="svcDescription">Description</Label>
              <Textarea id="svcDescription" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="svcPrice">Price</Label>
                <Input id="svcPrice" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="svcDuration">Duration (min)</Label>
                <Input id="svcDuration" type="number" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isBookable} onChange={(e) => setForm({ ...form, isBookable: e.target.checked })} />
                Bookable via WhatsApp
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active
              </label>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update service" : "Add service"}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Card key={s.id}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{s.name}</h3>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(s)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {s.description && <p className="text-sm text-muted-foreground">{s.description}</p>}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {s.price && <span>{formatCurrency(s.price)}</span>}
                {s.durationMin && <span>{s.durationMin} min</span>}
              </div>
              <div className="flex gap-1">
                <Badge variant={s.isActive ? "default" : "secondary"}>{s.isActive ? "Active" : "Inactive"}</Badge>
                {s.isBookable && <Badge variant="outline">Bookable</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
        {services.length === 0 && <p className="text-sm text-muted-foreground">No services added yet.</p>}
      </div>
    </div>
  );
}
