"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

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
  graphics: string | null;
  operatingSystem: string | null;
  inStock: boolean;
  stockQuantity: number;
  rating: number | null;
  reviewCount: number;
  featured: boolean;
};

const categories = [
  { key: "all", label: "All Products" },
  { key: "laptop", label: "Laptops" },
  { key: "desktop", label: "Desktops" },
  { key: "accessory", label: "Accessories" },
  { key: "part", label: "Parts" },
  { key: "service", label: "Services" },
];

const sortOptions = [
  { key: "newest", label: "Newest" },
  { key: "price_asc", label: "Price: Low to High" },
  { key: "price_desc", label: "Price: High to Low" },
  { key: "popularity", label: "Most Popular" },
  { key: "rating", label: "Highest Rated" },
];

const categoryColors: Record<string, string> = {
  laptop: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  desktop: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  accessory: "bg-green-500/10 text-green-400 border-green-500/20",
  part: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  service: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const productsPerPage = 12;

  // Track product view for recommendations
  const sessionId = typeof window !== "undefined" ? localStorage.getItem("sessionId") || `session_${Date.now()}` : "";

  useEffect(() => {
    if (!localStorage.getItem("sessionId")) {
      localStorage.setItem("sessionId", sessionId);
    }
    fetchProducts();
  }, [selectedCategory, sortBy, priceRange, inStockOnly, minRating, currentPage]);

  // Search suggestions debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      params.set("sortBy", sortBy);
      params.set("minPrice", priceRange[0].toString());
      params.set("maxPrice", priceRange[1].toString());
      if (inStockOnly) params.set("inStock", "true");
      if (minRating > 0) params.set("minRating", minRating.toString());
      params.set("page", currentPage.toString());
      params.set("limit", productsPerPage.toString());

      const res = await fetch(`/api/products/search?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setTotalProducts(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await fetch("/api/products/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      if (data.success) {
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    setCurrentPage(1);
    fetchProducts();
  };

  const trackProductView = async (productId: number) => {
    try {
      await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "track_view",
          sessionId,
          productId: productId.toString(),
        }),
      });
    } catch (error) {
      console.error("Error tracking product view:", error);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("newest");
    setPriceRange([0, 50000]);
    setInStockOnly(false);
    setMinRating(0);
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCategory !== "all",
    sortBy !== "newest",
    priceRange[0] > 0 || priceRange[1] < 50000,
    inStockOnly,
    minRating > 0,
  ].filter(Boolean).length;

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo-icon.svg"
                alt="RightClick Computer Digitals"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <div>
                <div className="text-white font-bold text-sm leading-tight">RIGHTCLICK</div>
                <div className="text-orange-400 text-xs tracking-widest">COMPUTER DIGITALS</div>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-300 hover:text-white transition text-sm">Home</Link>
              <Link href="/products" className="text-white font-medium transition text-sm">Products</Link>
              <Link href="/services" className="text-gray-300 hover:text-white transition text-sm">Services</Link>
              <Link href="/track-order" className="text-gray-300 hover:text-white transition text-sm">Track Order</Link>
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search products..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden z-50 shadow-xl">
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSearch(product.name)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-700 transition flex items-center justify-between"
                    >
                      <span className="text-white">{product.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[product.category] || "bg-gray-700 text-gray-400"}`}>
                        {product.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-xl text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
            >
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced Filters - Desktop */}
          <div className="hidden lg:flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-700">
            {/* Category */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => {
                    setSelectedCategory(cat.key);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-sm transition ${
                    selectedCategory === cat.key
                      ? "bg-orange-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Price Range */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Price:</span>
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                className="w-24 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="Min"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000])}
                className="w-24 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                placeholder="Max"
              />
            </div>

            {/* Stock Filter */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-orange-600 focus:ring-orange-600"
              />
              <span className="text-gray-300 text-sm">In Stock Only</span>
            </label>

            {/* Rating Filter */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Min Rating:</span>
              <select
                value={minRating}
                onChange={(e) => {
                  setMinRating(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value={0}>All</option>
                <option value={3}>3+ Stars</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-orange-400 hover:text-orange-300 text-sm"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Advanced Filters - Mobile */}
          {showFilters && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-700 space-y-4">
              {/* Category */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => {
                        setSelectedCategory(cat.key);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs transition ${
                        selectedCategory === cat.key
                          ? "bg-orange-600 text-white"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000])}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Stock Filter */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-orange-600"
                />
                <span className="text-gray-300 text-sm">In Stock Only</span>
              </label>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-orange-400 hover:text-orange-300 text-sm"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-400">
            {loading ? "Loading..." : `Showing ${products.length} of ${totalProducts} products`}
          </div>
          {activeFiltersCount > 0 && (
            <div className="text-sm text-orange-400">
              {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} active
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-white text-xl font-semibold mb-2">No Products Found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products?id=${product.id}`}
                onClick={() => trackProductView(product.id)}
                className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/5 transition group"
              >
                {product.imageUrl ? (
                  <div className="h-44 overflow-hidden bg-gray-900">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-44 bg-gray-900 flex items-center justify-center text-4xl">
                    🖥️
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
                  {(product.processor || product.ram || product.storage) && (
                    <div className="bg-gray-900/50 rounded-lg p-3 mb-3 space-y-1">
                      {product.processor && <p className="text-gray-400 text-xs"><span className="text-gray-500">CPU:</span> {product.processor}</p>}
                      {product.ram && <p className="text-gray-400 text-xs"><span className="text-gray-500">RAM:</span> {product.ram}</p>}
                      {product.storage && <p className="text-gray-400 text-xs"><span className="text-gray-500">Storage:</span> {product.storage}</p>}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-orange-400">₵{product.price.toFixed(2)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${product.inStock ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                      {product.inStock ? "✓ In Stock" : "Out of Stock"}
                    </span>
                  </div>
                  {product.rating && (
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-yellow-400">★</span>
                      <span className="text-gray-400 text-xs">{product.rating.toFixed(1)}</span>
                      <span className="text-gray-500 text-xs">({product.reviewCount})</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg ${
                      currentPage === pageNum
                        ? "bg-orange-600 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} RIGHTCLICK COMPUTER DIGITALS. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
