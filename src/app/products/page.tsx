import Link from "next/link";
import ChatWidget from "@/components/ChatWidget";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

async function getAllProducts() {
  try {
    return await db.select().from(products).where(eq(products.inStock, true));
  } catch {
    return [];
  }
}

export default async function ProductsPage() {
  const allProducts = await getAllProducts();

  const categories = [
    { key: "all", label: "All Products" },
    { key: "laptop", label: "Laptops" },
    { key: "desktop", label: "Desktops" },
    { key: "accessory", label: "Accessories" },
    { key: "part", label: "Parts" },
    { key: "service", label: "Services" },
  ];

  const categoryColors: Record<string, string> = {
    laptop: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    desktop: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    accessory: "bg-green-500/10 text-green-400 border-green-500/20",
    part: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    service: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RC</span>
              </div>
              <div>
                <div className="text-white font-bold text-sm leading-tight">RIGHTCLICK</div>
                <div className="text-orange-400 text-xs tracking-widest">COMPUTER DIGITALS</div>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-300 hover:text-white transition text-sm">Home</Link>
              <Link href="/products" className="text-white font-medium transition text-sm">Products</Link>
              <Link href="/services" className="text-gray-300 hover:text-white transition text-sm">Services</Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition text-sm">About</Link>
            </div>
            <Link href="/login" className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
              Staff Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-orange-950/30 border-b border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">Our Products</h1>
          <p className="text-gray-400">Browse our complete catalog — <span className="text-orange-400 italic">&ldquo;We give you options.&rdquo;</span></p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => {
            const count = cat.key === "all" ? allProducts.length : allProducts.filter(p => p.category === cat.key).length;
            return (
              <div key={cat.key} className="bg-gray-800 border border-gray-700 text-gray-300 px-4 py-2 rounded-full text-sm flex items-center gap-2">
                {cat.label}
                <span className="bg-gray-700 text-gray-400 text-xs px-1.5 py-0.5 rounded-full">{count}</span>
              </div>
            );
          })}
        </div>

        {allProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-white text-xl font-semibold mb-2">No Products Available</h3>
            <p className="text-gray-400">Check back soon for our latest inventory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allProducts.map((product) => (
              <div key={product.id} className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/5 transition group">
                {product.imageUrl && (
                  <div className="h-44 overflow-hidden bg-gray-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-white font-semibold leading-tight">{product.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 capitalize ${categoryColors[product.category] || "bg-gray-700 text-gray-400"}`}>
                      {product.category}
                    </span>
                  </div>
                  {product.description && (
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2">{product.description}</p>
                  )}
                  {(product.processor || product.ram || product.storage || product.graphics || product.operatingSystem) && (
                    <div className="bg-gray-900/50 rounded-lg p-3 mb-3 space-y-1">
                      {product.processor && <p className="text-gray-400 text-xs"><span className="text-gray-500">CPU:</span> {product.processor}</p>}
                      {product.ram && <p className="text-gray-400 text-xs"><span className="text-gray-500">RAM:</span> {product.ram}</p>}
                      {product.storage && <p className="text-gray-400 text-xs"><span className="text-gray-500">Storage:</span> {product.storage}</p>}
                      {product.graphics && <p className="text-gray-400 text-xs"><span className="text-gray-500">GPU:</span> {product.graphics}</p>}
                      {product.operatingSystem && <p className="text-gray-400 text-xs"><span className="text-gray-500">OS:</span> {product.operatingSystem}</p>}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-orange-400">₵{product.price.toFixed(2)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${product.inStock ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                      {product.inStock ? "✓ In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} RIGHTCLICK COMPUTER DIGITALS. All rights reserved. &mdash; <span className="italic">&ldquo;We give you options.&rdquo;</span>
        </div>
      </footer>

      {/* AI Chat Widget */}
      <ChatWidget />
    </div>
  );
}
