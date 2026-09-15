import { Bell, Search } from "lucide-react";
import AppShellNav from "@/components/dashboard/app-shell-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppShellNav />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-border/70 bg-background/80 px-5 backdrop-blur-xl sm:px-8">
          <div className="hidden items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm lg:flex">
            <Search className="h-4 w-4" />
            <span>Search your workspace</span>
            <kbd className="ml-12 rounded border bg-muted px-1.5 py-0.5 text-[10px]">⌘ K</kbd>
          </div>
          <p className="text-sm font-semibold text-foreground lg:hidden">FlowPilot</p>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 text-xs font-medium text-muted-foreground sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> System healthy
            </div>
            <button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500 text-xs font-bold text-white shadow-lg shadow-primary/20">WA</div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] p-5 pb-24 sm:p-8 sm:pb-10">{children}</main>
      </div>
    </div>
  );
}
