"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type ProductData = {
  id?: number;
  name: string;
  category: string;
  description: string;
  price: string;
  imageUrl: string;
  processor: string;
  ram: string;
  storage: string;
  graphics: string;
  operatingSystem: string;
  inStock: boolean;
  featured: boolean;
};

const defaultData: ProductData = {
  name: "",
  category: "laptop",
  description: "",
  price: "",
  imageUrl: "",
  processor: "",
  ram: "",
  storage: "",
  graphics: "",
  operatingSystem: "",
  inStock: true,
  featured: false,
};

export default function ProductForm({ initialData }: { initialData?: Partial<ProductData> & { id?: number } }) {
  const router = useRouter();
  const isEdit = !!initialData?.id;
  const [form, setForm] = useState<ProductData>({ ...defaultData, ...initialData, price: initialData?.price?.toString() || "" });
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
      const url = isEdit ? `/api/admin/products/${initialData!.id}` : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save product");
      } else {
        router.push("/admin/products");
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder-gray-600 text-sm";
  const labelClass = "block text-gray-300 text-sm font-medium mb-1.5";
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Allowed: JPG, JPEG, PNG, WebP");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Maximum size: 5MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to upload image");
        return;
      }

      setForm((prev) => ({ ...prev, imageUrl: data.imageUrl }));
    } catch {
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, imageUrl: e.target.value }));
  }

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
            <label className={labelClass}>Product Name *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder="e.g. ProBook Elite 15" />
          </div>
          <div>
            <label className={labelClass}>Category *</label>
            <select name="category" value={form.category} onChange={handleChange} required className={inputClass}>
              <option value="laptop">Laptop</option>
              <option value="desktop">Desktop</option>
              <option value="accessory">Accessory</option>
              <option value="part">Part</option>
              <option value="service">Service</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Price (GHS) *</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" step="0.01" className={inputClass} placeholder="0.00" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={inputClass} placeholder="Product description..." />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Product Image</label>
            <div className="space-y-3">
              {/* Current Image Preview */}
              {form.imageUrl && (
                <div className="relative inline-block">
                  <img 
                    src={form.imageUrl} 
                    alt="Product preview" 
                    className="h-24 w-24 object-cover rounded-lg border border-gray-600"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23374151" width="100" height="100"/><text x="50" y="50" fill="%239ca3af" text-anchor="middle" dy=".3em" font-size="12">No Image</text></svg>';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {/* URL Input */}
              <div className="flex gap-2">
                <input
                  type="url"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleUrlChange}
                  className={inputClass}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              {/* File Upload */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    id="product-image-upload"
                  />
                  <label
                    htmlFor="product-image-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-600 hover:border-blue-500 cursor-pointer transition ${uploading ? 'opacity-50 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700'} text-white text-sm`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {uploading ? "Uploading..." : "Upload Image"}
                  </label>
                </div>
                <span className="text-gray-500 text-xs">JPG, PNG, WebP (max 5MB)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-5">Technical Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Processor</label>
            <input type="text" name="processor" value={form.processor} onChange={handleChange} className={inputClass} placeholder="e.g. Intel Core i7-13th Gen" />
          </div>
          <div>
            <label className={labelClass}>RAM</label>
            <input type="text" name="ram" value={form.ram} onChange={handleChange} className={inputClass} placeholder="e.g. 16GB DDR5" />
          </div>
          <div>
            <label className={labelClass}>Storage</label>
            <input type="text" name="storage" value={form.storage} onChange={handleChange} className={inputClass} placeholder="e.g. 512GB NVMe SSD" />
          </div>
          <div>
            <label className={labelClass}>Graphics Card</label>
            <input type="text" name="graphics" value={form.graphics} onChange={handleChange} className={inputClass} placeholder="e.g. NVIDIA RTX 4070" />
          </div>
          <div>
            <label className={labelClass}>Operating System</label>
            <input type="text" name="operatingSystem" value={form.operatingSystem} onChange={handleChange} className={inputClass} placeholder="e.g. Windows 11 Pro" />
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-5">Visibility & Status</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="inStock"
              checked={form.inStock}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="text-white text-sm font-medium">In Stock</div>
              <div className="text-gray-500 text-xs">Product is available for purchase</div>
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
              <div className="text-white text-sm font-medium">Featured Product</div>
              <div className="text-gray-500 text-xs">Show on homepage featured section</div>
            </div>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold px-8 py-3 rounded-xl transition flex items-center gap-2"
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
            isEdit ? "Update Product" : "Add Product"
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="text-gray-400 hover:text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
