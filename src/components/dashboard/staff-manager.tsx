"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StaffMember {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export default function StaffManager({ staff, currentEmail }: { staff: StaffMember[]; currentEmail: string | null }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to add staff member");
      setName("");
      setEmail("");
      setPassword("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add staff member");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Remove this staff member's access?")) return;
    const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data?.error || "Failed to remove staff member");
      return;
    }
    router.refresh();
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Staff access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          {staff.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-md border px-3 py-2">
              <div>
                <p className="text-sm font-medium">{s.name || s.email}</p>
                <p className="text-xs text-muted-foreground">
                  {s.email}
                  {s.email === currentEmail && " (you)"}
                </p>
              </div>
              {s.email !== currentEmail && (
                <Button variant="outline" size="sm" onClick={() => handleRemove(s.id)}>
                  Remove
                </Button>
              )}
            </div>
          ))}
          {staff.length === 0 && <p className="text-sm text-muted-foreground">No staff accounts yet.</p>}
        </div>

        <form onSubmit={handleAdd} className="space-y-3 border-t pt-4">
          <p className="text-sm font-medium">Add a staff member</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="staffName">Name</Label>
              <Input id="staffName" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staffEmail">Email</Label>
              <Input id="staffEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="staffPassword">Temporary password</Label>
            <Input
              id="staffPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? "Adding..." : "Add staff member"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
