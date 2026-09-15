import { prisma } from "@/lib/prisma";
import FaqManager from "@/components/automation/faq-manager";

export const dynamic = "force-dynamic";

export default async function FaqsPage() {
  const faqs = await prisma.faq.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <div><p className="page-kicker">Knowledge base</p><h1 className="page-title">Answers at the ready.</h1><p className="page-description">Give your automation a dependable source of fast, on-brand answers.</p></div>
      <FaqManager faqs={faqs} />
    </div>
  );
}
