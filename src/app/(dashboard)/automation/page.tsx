import { prisma } from "@/lib/prisma";
import RulesManager from "@/components/automation/rules-manager";

export const dynamic = "force-dynamic";

export default async function AutomationPage() {
  const rules = await prisma.automationRule.findMany({ orderBy: [{ priority: "desc" }, { createdAt: "desc" }] });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Automation Rules</h1>
        <p className="text-sm text-muted-foreground">
          Keyword-triggered responses and the fallback message the bot uses when nothing else matches.
          FAQs and Services are managed on their own pages, and the welcome message + handoff keywords are in Settings.
        </p>
      </div>
      <RulesManager rules={rules} />
    </div>
  );
}
