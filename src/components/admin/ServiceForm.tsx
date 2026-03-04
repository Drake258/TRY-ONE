"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ServiceData = {
  id?: number;
  name: string;
  category: string;
  description: string;
  price: string;
  duration: string;
  featured: boolean;
  active: boolean;
};

const defaultData: ServiceData = {
  name: "",
  category: "repair",
  description: "",
  price: "",
  duration: "",
  featured: false,
  active: true,
};

export default function ServiceForm({ initialData }: { initialData?: Partial<ServiceData> & { id?: number } }) {
  const router = useRouter();
  const isEdit = !!initialData?.id;
  const [form, setForm] = useState<ServiceData>({ ...defaultData, ...initialData, price: initialData?.price?.toString() || "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = isEdit ? `/api/admin/services/${initialData!.id}` : "/api/admin/services";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save service");
      } else {
        router.push("/admin/services");
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-blue-500 transition placeholder-gray-600 text-sm";
  const labelClass = "block text-gray-300 text-sm font-medium mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-5">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={labelClass}>Service Name *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder="e.g. Computer Repair" />
          </div>
          <div>
            <label className={labelClass}>Category *</label>
            <select name="category" value={form.category} onChange={handleChange} required className={inputClass}>
              <option value="repair">Repair</option>
              <option value="installation">Installation</option>
              <option value="maintenance">Maintenance</option>
              <option value="consultation">Consultation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Price (₵) *</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" step="0.01" className={inputClass} placeholder="0.00" />
          </div>
          <div>
            <label className={labelClass}>Duration</label>
            <input type="text" name="duration" value={form.duration} onChange={handleChange} className={inputClass} placeholder="e.g. 1-2 hours, 2 days" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={inputClass} placeholder="Service description..." />
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-5">Visibility & Status</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="text-white text-sm font-medium">Active</div>
              <div className="text-gray-500 text-xs">Service is available for customers</div>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="text-white text-sm font-medium">Featured Service</div>
              <div className="text-gray-500 text-xs">Show on homepage featured section</div>
            </div>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white font-semibold px-8 py-3 rounded-xl transition flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : (
            isEdit ? "Update Service" : "Add Service"
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/services")}
          className="text-gray-400 hover:text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
