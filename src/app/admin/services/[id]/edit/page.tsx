import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ServiceForm from "@/components/admin/ServiceForm";
import Link from "next/link";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const serviceId = parseInt(id);

  if (isNaN(serviceId)) notFound();

  const result = await db.select().from(services).where(eq(services.id, serviceId));
  if (result.length === 0) notFound();

  const service = result[0];

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
          <Link href="/admin/services" className="hover:text-white transition">Services</Link>
          <span>/</span>
          <span className="text-white">Edit</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Edit Service</h1>
        <p className="text-gray-400 mt-1">Update the details for <span className="text-white">{service.name}</span></p>
      </div>
      <div className="max-w-3xl">
        <ServiceForm
          initialData={{
            id: service.id,
            name: service.name,
            category: service.category,
            description: service.description || "",
            price: service.price.toString(),
            duration: service.duration || "",
            featured: service.featured,
            active: service.active,
          }}
        />
      </div>
    </div>
  );
}
