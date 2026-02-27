import { db } from "@/db";
import { products } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import ProductActions from "@/components/admin/ProductActions";

async function getProducts() {
  return await db.select().from(products).orderBy(desc(products.createdAt));
}

export default async function AdminProductsPage() {
  const allProducts = await getProducts();

  const categoryColors: Record<string, string> = {
    laptop: "bg-blue-500/10 text-blue-400",
    desktop: "bg-purple-500/10 text-purple-400",
    accessory: "bg-green-500/10 text-green-400",
    part: "bg-yellow-500/10 text-yellow-400",
    service: "bg-orange-500/10 text-orange-400",
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <p className="text-gray-400 mt-1">{allProducts.length} total products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition flex items-center gap-2"
        >
          <span>+</span> Add Product
        </Link>
      </div>

      {allProducts.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-white text-xl font-semibold mb-2">No Products Yet</h3>
          <p className="text-gray-400 mb-6">Start by adding your first product.</p>
          <Link href="/admin/products/new" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition">
            Add First Product
          </Link>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Product</th>
                  <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Category</th>
                  <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Price</th>
                  <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Status</th>
                  <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Featured</th>
                  <th className="text-right text-gray-400 text-sm font-medium px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-800" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500 text-lg">🖥️</div>
                        )}
                        <div>
                          <div className="text-white font-medium text-sm">{product.name}</div>
                          {product.processor && <div className="text-gray-500 text-xs">{product.processor}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${categoryColors[product.category] || "bg-gray-700 text-gray-400"}`}>
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-blue-400 font-semibold">${product.price.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${product.inStock ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${product.featured ? "bg-yellow-500/10 text-yellow-400" : "bg-gray-700 text-gray-500"}`}>
                        {product.featured ? "⭐ Featured" : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ProductActions productId={product.id} />
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
