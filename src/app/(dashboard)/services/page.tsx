import { prisma } from "@/lib/prisma";
import ServiceManager from "@/components/automation/service-manager";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Services</h1>
      <ServiceManager services={services.map((s: any) => ({ ...s, price: s.price?.toString() ?? null }))} />
    </div>
  );
}
