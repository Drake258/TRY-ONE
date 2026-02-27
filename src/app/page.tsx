import Link from "next/link";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function getFeaturedProducts() {
  try {
    return await db.select().from(products).where(and(eq(products.featured, true), eq(products.inStock, true))).limit(6);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RC</span>
              </div>
              <div>
                <div className="text-white font-bold text-sm leading-tight">RIGHTCLICK</div>
                <div className="text-blue-400 text-xs tracking-widest">COMPUTER DIGITALS</div>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-300 hover:text-white transition text-sm">Home</Link>
              <Link href="/products" className="text-gray-300 hover:text-white transition text-sm">Products</Link>
              <Link href="/services" className="text-gray-300 hover:text-white transition text-sm">Services</Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition text-sm">About</Link>
            </div>
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-950/50 to-gray-900 py-24 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-blue-400 text-sm font-medium">Your Trusted Tech Partner</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              <span className="text-white">RIGHTCLICK</span>
              <br />
              <span className="text-blue-400">COMPUTER DIGITALS</span>
            </h1>
            <p className="text-2xl text-gray-300 font-light mb-4 italic">&ldquo;We give you options.&rdquo;</p>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              Your one-stop destination for computers, laptops, accessories, and professional repair services.
              Browse our selection and find the perfect tech solution for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition text-lg"
              >
                Browse Products
              </Link>
              <Link
                href="/services"
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold px-8 py-4 rounded-xl transition text-lg"
              >
                Our Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-blue-600 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "500+", label: "Products Available" },
              { value: "1000+", label: "Happy Customers" },
              { value: "5+", label: "Years Experience" },
              { value: "24/7", label: "Support Available" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-blue-100 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-white">Featured Products</h2>
                <p className="text-gray-400 mt-2">Hand-picked selections for you</p>
              </div>
              <Link href="/products" className="text-blue-400 hover:text-blue-300 transition text-sm font-medium">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Our Services</h2>
            <p className="text-gray-400 mt-2">Professional tech solutions for every need</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🖥️",
                title: "Computer Sales",
                desc: "Wide range of laptops, desktops, and accessories from top brands at competitive prices.",
              },
              {
                icon: "🔧",
                title: "Repair Services",
                desc: "Expert repair services for all computer brands. Fast turnaround, quality guaranteed.",
              },
              {
                icon: "💡",
                title: "Tech Consultation",
                desc: "Not sure what to buy? Our experts will help you find the perfect solution for your needs.",
              },
            ].map((service) => (
              <div key={service.title} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Why Choose RIGHTCLICK?</h2>
            <p className="text-gray-400 mt-2">We give you options — and so much more</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "✅", title: "Quality Products", desc: "Only genuine, tested products from trusted brands." },
              { icon: "💰", title: "Best Prices", desc: "Competitive pricing with no hidden fees." },
              { icon: "🚀", title: "Fast Service", desc: "Quick repairs and same-day service available." },
              { icon: "🛡️", title: "Warranty", desc: "All products come with manufacturer warranty." },
            ].map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-900/50 to-blue-800/30 border-y border-blue-800/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Perfect Tech?</h2>
          <p className="text-gray-300 mb-8">Browse our full catalog of computers, accessories, and services.</p>
          <Link
            href="/products"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-4 rounded-xl transition text-lg inline-block"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RC</span>
                </div>
                <div>
                  <div className="text-white font-bold text-sm">RIGHTCLICK</div>
                  <div className="text-blue-400 text-xs tracking-widest">COMPUTER DIGITALS</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm italic">&ldquo;We give you options.&rdquo;</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Quick Links</h4>
              <div className="space-y-2">
                {["Products", "Services", "About", "Contact"].map((link) => (
                  <Link key={link} href={`/${link.toLowerCase()}`} className="block text-gray-400 hover:text-white transition text-sm">
                    {link}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Contact Us</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <p>📧 info@rightclickdigitals.com</p>
                <p>📞 +1 (555) 123-4567</p>
                <p>📍 123 Tech Street, Digital City</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} RIGHTCLICK COMPUTER DIGITALS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

type Product = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  processor: string | null;
  ram: string | null;
  storage: string | null;
  inStock: boolean;
};

function ProductCard({ product }: { product: Product }) {
  const categoryColors: Record<string, string> = {
    laptop: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    desktop: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    accessory: "bg-green-500/10 text-green-400 border-green-500/20",
    part: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    service: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition group">
      {product.imageUrl && (
        <div className="h-48 overflow-hidden bg-gray-900">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-white font-semibold text-lg leading-tight">{product.name}</h3>
          <span className={`text-xs px-2 py-1 rounded-full border flex-shrink-0 capitalize ${categoryColors[product.category] || "bg-gray-700 text-gray-400"}`}>
            {product.category}
          </span>
        </div>
        {product.description && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
        )}
        {(product.processor || product.ram || product.storage) && (
          <div className="space-y-1 mb-3">
            {product.processor && <p className="text-gray-500 text-xs">🔲 {product.processor}</p>}
            {product.ram && <p className="text-gray-500 text-xs">💾 {product.ram}</p>}
            {product.storage && <p className="text-gray-500 text-xs">💿 {product.storage}</p>}
          </div>
        )}
        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-bold text-blue-400">${product.price.toFixed(2)}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${product.inStock ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {product.inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      </div>
    </div>
  );
}
