import { prisma } from "@/lib/prisma";
import ServiceManager from "@/components/automation/service-manager";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <div><p className="page-kicker">Service catalogue</p><h1 className="page-title">What can customers book?</h1><p className="page-description">Shape the services your automation can introduce and route into booking conversations.</p></div>
      <ServiceManager services={services.map((s: any) => ({ ...s, price: s.price?.toString() ?? null }))} />
    </div>
  );
}
