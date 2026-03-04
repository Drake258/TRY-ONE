import { db } from "@/db";
import { services } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import ServiceActions from "@/components/admin/ServiceActions";

async function getServices() {
  return await db.select().from(services).orderBy(desc(services.createdAt));
}

export default async function AdminServicesPage() {
  const allServices = await getServices();

  const categoryColors: Record<string, string> = {
    repair: "bg-red-500/10 text-red-400",
    installation: "bg-violet-500/10 text-violet-400",
    maintenance: "bg-green-500/10 text-green-400",
    consultation: "bg-purple-500/10 text-purple-400",
    other: "bg-gray-500/10 text-gray-400",
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Services</h1>
          <p className="text-gray-400 mt-1">{allServices.length} total services</p>
        </div>
        <Link
          href="/admin/services/new"
          className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-5 py-2.5 rounded-xl transition flex items-center gap-2"
        >
          <span>+</span> Add Service
        </Link>
      </div>

      {allServices.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
          <div className="text-5xl mb-4">🔧</div>
          <h3 className="text-white text-xl font-semibold mb-2">No Services Yet</h3>
          <p className="text-gray-400 mb-6">Start by adding your first service.</p>
          <Link href="/admin/services/new" className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl transition">
            Add First Service
          </Link>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Service</th>
                  <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Category</th>
                  <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Price</th>
                  <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Duration</th>
                  <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Status</th>
                  <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Featured</th>
                  <th className="text-right text-gray-400 text-sm font-medium px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allServices.map((service) => (
                  <tr key={service.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium text-sm">{service.name}</div>
                      {service.description && (
                        <div className="text-gray-500 text-xs truncate max-w-xs">{service.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${categoryColors[service.category] || "bg-gray-700 text-gray-400"}`}>
                        {service.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-violet-400 font-semibold">₵{service.price.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-sm">{service.duration || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${service.active ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                        {service.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${service.featured ? "bg-yellow-500/10 text-yellow-400" : "bg-gray-700 text-gray-500"}`}>
                        {service.featured ? "⭐ Featured" : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ServiceActions serviceId={service.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
