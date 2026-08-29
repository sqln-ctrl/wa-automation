import { prisma } from "@/lib/prisma";
import FaqManager from "@/components/automation/faq-manager";

export const dynamic = "force-dynamic";

export default async function FaqsPage() {
  const faqs = await prisma.faq.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">FAQs</h1>
      <FaqManager faqs={faqs} />
    </div>
  );
}
