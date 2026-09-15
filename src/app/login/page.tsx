"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Invalid email or password");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(129,140,248,0.32),transparent_24rem),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.22),transparent_28rem)]" />
        <Link href="/" className="relative flex items-center gap-3 self-start">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 shadow-lg shadow-indigo-500/30"><Sparkles className="h-5 w-5" /></span>
          <span><span className="block text-sm font-semibold">FlowPilot</span><span className="block text-xs text-slate-400">Automation workspace</span></span>
        </Link>
        <div className="relative my-auto max-w-xl pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">Customer conversations, orchestrated</p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.04] tracking-[-0.055em]">Make every WhatsApp reply feel like your best team member.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-slate-300">A focused automation workspace for helpful, timely customer communication.</p>
          <div className="mt-10 space-y-4 text-sm text-slate-300">
            {["Keep every conversation in context", "Let rules handle the repeatable work", "Take over with one click when it matters"].map((item) => (
              <div key={item} className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-400" /> {item}</div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-slate-500">Private access for your business and approved staff.</p>
      </section>

      <section className="relative flex items-center justify-center bg-background px-5 py-10 sm:px-8">
        <div className="absolute inset-0 subtle-grid opacity-40" />
        <div className="relative w-full max-w-md">
          <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:hidden"><ArrowLeft className="h-4 w-4" /> Back to home</Link>
          <div className="rounded-[1.75rem] border border-border/80 bg-card p-7 shadow-[0_24px_60px_-30px_rgba(33,38,94,0.35)] sm:p-9">
            <div className="mb-8">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><LockKeyhole className="h-5 w-5" /></div>
              <p className="page-kicker">Welcome back</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Sign in to FlowPilot</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Enter your workspace credentials to manage your automations.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
              </div>
              {error && <p className="rounded-xl border border-destructive/15 bg-destructive/5 px-3.5 py-3 text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? "Signing you in..." : "Sign in to workspace"}</Button>
            </form>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">Need access? Ask a workspace administrator to add you in Settings.</p>
        </div>
      </section>
    </main>
  );
}
