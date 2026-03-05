"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ChatWidget from "@/components/ChatWidget";

// Types
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
  featured: boolean;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type Tab = "home" | "products" | "services" | "cart" | "application";

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{orderNumber: string; trackingNumber: string} | null>(null);
  
  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    shippingAddress: "",
    billingAddress: "",
    city: "",
    region: "",
  });
  
  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{code: string; discount: number; discountType: 'percent' | 'fixed'} | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  
  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<"mtn" | "telecel" | "airteltigo" | "visa" | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Application form state
  const [appForm, setAppForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    cvFile: null as File | null,
  });
  const [appSubmitting, setAppSubmitting] = useState(false);
  const [appSuccess, setAppSuccess] = useState(false);
  const [appError, setAppError] = useState("");

  // Load products on mount
  useEffect(() => {
    fetchProducts();
    loadCartFromStorage();
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const getCartTotal = () => {
    let total = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    if (appliedPromo) {
      if (appliedPromo.discountType === 'percent') {
        total = total - (total * appliedPromo.discount / 100);
      } else {
        total = Math.max(0, total - appliedPromo.discount);
      }
    }
    return total;
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    setPromoError("");
    setPromoLoading(true);
    
    // Simulate promo code validation (in real app, this would call an API)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Demo promo codes
    const promoCodes: Record<string, {discount: number; discountType: 'percent' | 'fixed'}> = {
      'WELCOME10': { discount: 10, discountType: 'percent' },
      'SAVE50': { discount: 50, discountType: 'fixed' },
      'NEWUSER': { discount: 15, discountType: 'percent' },
    };
    
    const promo = promoCodes[promoCode.toUpperCase()];
    if (promo) {
      setAppliedPromo({ code: promoCode.toUpperCase(), ...promo });
    } else {
      setPromoError("Invalid promo code");
    }
    setPromoLoading(false);
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode("");
  };

  const handleCheckout = () => {
    setShowCheckout(true);
    setShowPayment(false);
  };

  const confirmOrder = async () => {
    // Validate customer form
    if (!customerForm.fullName || !customerForm.phoneNumber) {
      alert("Please enter your name and phone number");
      return;
    }

    // Generate payment reference
    const ref = `RC${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setPaymentReference(ref);

    try {
      const orderItems = cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerForm.fullName,
          customerPhone: customerForm.phoneNumber,
          customerEmail: customerForm.email || undefined,
          shippingAddress: customerForm.shippingAddress || undefined,
          billingAddress: customerForm.billingAddress || undefined,
          items: orderItems,
          totalAmount: getCartTotal(),
          paymentMethod: paymentMethod || 'mtn',
          promoCode: appliedPromo?.code || null,
          discount: appliedPromo ? (appliedPromo.discountType === 'percent' ? (getCartTotal() * appliedPromo.discount / 100) : appliedPromo.discount) : null,
          paymentReference: ref,
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setOrderDetails({
          orderNumber: data.order.orderNumber,
          trackingNumber: data.order.trackingNumber
        });
        setShowPayment(true);
      } else {
        alert("Failed to create order. Please try again.");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    }
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppSubmitting(true);
    setAppError("");

    try {
      let cvPath = null;
      
      // Upload CV if provided
      if (appForm.cvFile) {
        const formData = new FormData();
        formData.append("cv", appForm.cvFile);
        
        const cvRes = await fetch("/api/admin/cv-upload", {
          method: "POST",
          body: formData,
        });
        
        if (cvRes.ok) {
          const cvData = await cvRes.json();
          cvPath = cvData.cvUrl;
        }
      }

      // Submit application
      const res = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: appForm.fullName,
          phoneNumber: appForm.phoneNumber,
          email: appForm.email,
          cvPath,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setAppSuccess(true);
        setAppForm({ fullName: "", phoneNumber: "", email: "", cvFile: null });
      } else {
        setAppError(data.error || "Failed to submit application");
      }
    } catch (error) {
      setAppError("An error occurred. Please try again.");
    } finally {
      setAppSubmitting(false);
    }
  };

  const featuredProducts = products.filter((p) => p.featured && p.inStock).slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3" onClick={() => setActiveTab("home")}>
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
              <button onClick={() => setActiveTab("home")} className={`text-sm font-medium transition ${activeTab === "home" ? "text-orange-400" : "text-gray-300 hover:text-white"}`}>
                Home
              </button>
              <button onClick={() => setActiveTab("products")} className={`text-sm font-medium transition ${activeTab === "products" ? "text-orange-400" : "text-gray-300 hover:text-white"}`}>
                Products
              </button>
              <button onClick={() => setActiveTab("services")} className={`text-sm font-medium transition ${activeTab === "services" ? "text-orange-400" : "text-gray-300 hover:text-white"}`}>
                Services
              </button>
              <button onClick={() => setActiveTab("application")} className={`text-sm font-medium transition ${activeTab === "application" ? "text-orange-400" : "text-gray-300 hover:text-white"}`}>
                Application
              </button>
              <button onClick={() => setActiveTab("cart")} className={`text-sm font-medium transition relative ${activeTab === "cart" ? "text-orange-400" : "text-gray-300 hover:text-white"}`}>
                Cart
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-3 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
            <Link
              href="/login"
              className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
        <div className="flex justify-around py-2">
          <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center py-2 px-3 ${activeTab === "home" ? "text-orange-400" : "text-gray-400"}`}>
            <span>🏠</span>
            <span className="text-xs">Home</span>
          </button>
          <button onClick={() => setActiveTab("products")} className={`flex flex-col items-center py-2 px-3 ${activeTab === "products" ? "text-orange-400" : "text-gray-400"}`}>
            <span>🛒</span>
            <span className="text-xs">Products</span>
          </button>
          <button onClick={() => setActiveTab("services")} className={`flex flex-col items-center py-2 px-3 ${activeTab === "services" ? "text-orange-400" : "text-gray-400"}`}>
            <span>🔧</span>
            <span className="text-xs">Services</span>
          </button>
          <button onClick={() => setActiveTab("cart")} className={`flex flex-col items-center py-2 px-3 relative ${activeTab === "cart" ? "text-orange-400" : "text-gray-400"}`}>
            <span>🛍️</span>
            <span className="text-xs">Cart</span>
            {cart.length > 0 && (
              <span className="absolute top-0 right-2 bg-orange-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab("application")} className={`flex flex-col items-center py-2 px-3 ${activeTab === "application" ? "text-orange-400" : "text-gray-400"}`}>
            <span>📝</span>
            <span className="text-xs">Apply</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "home" && (
        <>
          {/* Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-orange-950/50 to-gray-900 py-24 px-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent" />
            <div className="max-w-7xl mx-auto relative">
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-orange-600/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span className="text-orange-400 text-sm font-medium">Your Trusted Tech Partner</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                  <span className="text-white">RIGHTCLICK</span>
                  <br />
                  <span className="text-orange-400">COMPUTER DIGITALS</span>
                </h1>
                <p className="text-2xl text-gray-300 font-light mb-4 italic">&ldquo;We give you options.&rdquo;</p>
                <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
                  Your one-stop destination for computers, laptops, accessories, and professional repair services.
                  Browse our selection and find the perfect tech solution for you.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setActiveTab("products")}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-4 rounded-xl transition text-lg"
                  >
                    Browse Products
                  </button>
                  <button
                    onClick={() => setActiveTab("services")}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold px-8 py-4 rounded-xl transition text-lg"
                  >
                    Our Services
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Bar */}
          <section className="bg-orange-600 py-8">
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
                    <div className="text-orange-100 text-sm mt-1">{stat.label}</div>
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
                  <button onClick={() => setActiveTab("products")} className="text-orange-400 hover:text-orange-300 transition text-sm font-medium">
                    View All →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
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
                  <div key={service.title} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-orange-500/50 transition">
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
          <section className="py-20 px-4 bg-gradient-to-r from-orange-900/50 to-orange-800/30 border-y border-orange-800/30">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Perfect Tech?</h2>
              <p className="text-gray-300 mb-8">Browse our full catalog of computers, accessories, and services.</p>
              <button
                onClick={() => setActiveTab("products")}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-10 py-4 rounded-xl transition text-lg inline-block"
              >
                Shop Now
              </button>
            </div>
          </section>
        </>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">All Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.filter(p => p.inStock).map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Tab */}
      {activeTab === "services" && (
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-orange-500/50 transition">
                <div className="text-4xl mb-4">🖥️</div>
                <h3 className="text-white font-bold text-lg mb-2">Computer Sales</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Wide range of laptops, desktops, and accessories from top brands at competitive prices.</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-orange-500/50 transition">
                <div className="text-4xl mb-4">🔧</div>
                <h3 className="text-white font-bold text-lg mb-2">Repair Services</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Expert repair services for all computer brands. Fast turnaround, quality guaranteed.</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-orange-500/50 transition">
                <div className="text-4xl mb-4">💡</div>
                <h3 className="text-white font-bold text-lg mb-2">Tech Consultation</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Not sure what to buy? Our experts will help you find the perfect solution for your needs.</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-orange-500/50 transition">
                <div className="text-4xl mb-4">🛠️</div>
                <h3 className="text-white font-bold text-lg mb-2">Installation Services</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Professional installation of software, hardware, and operating systems.</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-orange-500/50 transition">
                <div className="text-4xl mb-4">🧹</div>
                <h3 className="text-white font-bold text-lg mb-2">Maintenance</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Regular maintenance to keep your systems running smoothly and efficiently.</p>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 hover:border-orange-500/50 transition">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-white font-bold text-lg mb-2">Security Solutions</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Virus removal, malware protection, and security system setup.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Cart Tab */}
      {activeTab === "cart" && (
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">Shopping Cart</h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-gray-400 text-lg mb-6">Your cart is empty</p>
                <button
                  onClick={() => setActiveTab("products")}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-xl transition"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-8">
                  {cart.map((item) => (
                    <div key={item.product.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center gap-4">
                      {item.product.imageUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg" />
                      )}
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{item.product.name}</h3>
                        <p className="text-orange-400 font-bold">₵{item.product.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-white"
                        >
                          -
                        </button>
                        <span className="text-white font-semibold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-white"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
                  <h3 className="text-white font-bold text-lg mb-4">Order Summary</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                      <span>₵{cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between text-green-400">
                        <span>Discount ({appliedPromo.code})</span>
                        <span>-₵{appliedPromo.discountType === 'percent' 
                          ? ((cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0) * appliedPromo.discount / 100)).toFixed(2)
                          : appliedPromo.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-400">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-700 pt-4 flex justify-between">
                    <span className="text-white font-bold text-xl">Total</span>
                    <span className="text-orange-400 font-bold text-xl">₵{getCartTotal().toFixed(2)}</span>
                  </div>
                  
                  {/* Promo Code Section */}
                  {!showCheckout && !appliedPromo && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <label className="text-gray-400 text-sm mb-2 block">Promo Code</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                          placeholder="Enter promo code"
                        />
                        <button
                          onClick={applyPromoCode}
                          disabled={promoLoading || !promoCode.trim()}
                          className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                        >
                          {promoLoading ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                      {promoError && <p className="text-red-400 text-sm mt-2">{promoError}</p>}
                      <p className="text-gray-500 text-xs mt-2">Try: WELCOME10, SAVE50, or NEWUSER</p>
                    </div>
                  )}
                  {appliedPromo && (
                    <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between bg-green-900/20 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-green-400 font-medium">{appliedPromo.code} applied</span>
                      </div>
                      <button onClick={removePromoCode} className="text-gray-400 hover:text-white text-sm">
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Checkout Button */}
                {!showCheckout ? (
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 rounded-xl transition text-lg"
                  >
                    Proceed to Checkout
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                      <h3 className="text-white font-bold text-lg mb-4">Confirm Your Order</h3>
                      <div className="space-y-2 mb-6">
                        {cart.map((item) => (
                          <div key={item.product.id} className="flex justify-between text-gray-300">
                            <span>{item.product.name} x {item.quantity}</span>
                            <span>₵{(item.product.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-700 pt-2 flex justify-between text-white font-bold">
                          <span>Total</span>
                          <span>₵{getCartTotal().toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {!showPayment ? (
                        <>
                          {/* Customer Details Form */}
                          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-4">
                            <h3 className="text-white font-bold text-lg mb-4">Your Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-gray-400 text-sm mb-1 block">Full Name *</label>
                                <input
                                  type="text"
                                  value={customerForm.fullName}
                                  onChange={(e) => setCustomerForm({ ...customerForm, fullName: e.target.value })}
                                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                                  placeholder="Enter your full name"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-gray-400 text-sm mb-1 block">Phone Number *</label>
                                <input
                                  type="tel"
                                  value={customerForm.phoneNumber}
                                  onChange={(e) => setCustomerForm({ ...customerForm, phoneNumber: e.target.value })}
                                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                                  placeholder="Enter your phone number"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-gray-400 text-sm mb-1 block">Email (Optional)</label>
                                <input
                                  type="email"
                                  value={customerForm.email}
                                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                                  placeholder="Enter your email"
                                />
                              </div>
                              <div>
                                <label className="text-gray-400 text-sm mb-1 block">City</label>
                                <input
                                  type="text"
                                  value={customerForm.city}
                                  onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                                  placeholder="e.g., Accra"
                                />
                              </div>
                              <div>
                                <label className="text-gray-400 text-sm mb-1 block">Region</label>
                                <input
                                  type="text"
                                  value={customerForm.region}
                                  onChange={(e) => setCustomerForm({ ...customerForm, region: e.target.value })}
                                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                                  placeholder="e.g., Greater Accra"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Shipping Address */}
                          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-4">
                            <h3 className="text-white font-bold text-lg mb-4">Shipping Address</h3>
                            <div>
                              <label className="text-gray-400 text-sm mb-1 block">Delivery Address (Optional)</label>
                              <textarea
                                value={customerForm.shippingAddress}
                                onChange={(e) => setCustomerForm({ ...customerForm, shippingAddress: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                                placeholder="Enter your address for delivery"
                                rows={2}
                              />
                            </div>
                          </div>
                          
                          {/* Billing Address */}
                          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-4">
                            <h3 className="text-white font-bold text-lg mb-4">Billing Address</h3>
                            <div>
                              <label className="text-gray-400 text-sm mb-1 block">Billing Address (Optional)</label>
                              <textarea
                                value={customerForm.billingAddress}
                                onChange={(e) => setCustomerForm({ ...customerForm, billingAddress: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                                placeholder="Enter your billing address (if different from shipping)"
                                rows={2}
                              />
                            </div>
                          </div>
                          
                          {/* Payment Method */}
                          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-4">
                            <h3 className="text-white font-bold text-lg mb-4">Select Payment Method</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              <label className={`cursor-pointer bg-gray-900 border-2 rounded-xl p-4 transition ${paymentMethod === 'mtn' ? 'border-yellow-500 bg-yellow-900/20' : 'border-gray-700 hover:border-gray-600'}`}>
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value="mtn"
                                  checked={paymentMethod === 'mtn'}
                                  onChange={() => setPaymentMethod('mtn')}
                                  className="sr-only"
                                />
                                <div className="text-center">
                                  <div className="text-3xl mb-2">📱</div>
                                  <div className="text-white font-semibold">MTN</div>
                                  <div className="text-gray-400 text-xs">Mobile Money</div>
                                </div>
                              </label>
                              <label className={`cursor-pointer bg-gray-900 border-2 rounded-xl p-4 transition ${paymentMethod === 'telecel' ? 'border-red-500 bg-red-900/20' : 'border-gray-700 hover:border-gray-600'}`}>
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value="telecel"
                                  checked={paymentMethod === 'telecel'}
                                  onChange={() => setPaymentMethod('telecel')}
                                  className="sr-only"
                                />
                                <div className="text-center">
                                  <div className="text-3xl mb-2">📱</div>
                                  <div className="text-white font-semibold">Telecel</div>
                                  <div className="text-gray-400 text-xs">Mobile Money</div>
                                </div>
                              </label>
                              <label className={`cursor-pointer bg-gray-900 border-2 rounded-xl p-4 transition ${paymentMethod === 'airteltigo' ? 'border-orange-500 bg-orange-900/20' : 'border-gray-700 hover:border-gray-600'}`}>
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value="airteltigo"
                                  checked={paymentMethod === 'airteltigo'}
                                  onChange={() => setPaymentMethod('airteltigo')}
                                  className="sr-only"
                                />
                                <div className="text-center">
                                  <div className="text-3xl mb-2">📱</div>
                                  <div className="text-white font-semibold">AirtelTigo</div>
                                  <div className="text-gray-400 text-xs">Mobile Money</div>
                                </div>
                              </label>
                              <label className={`cursor-pointer bg-gray-900 border-2 rounded-xl p-4 transition ${paymentMethod === 'visa' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:border-gray-600'} col-span-2 md:col-span-3`}>
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value="visa"
                                  checked={paymentMethod === 'visa'}
                                  onChange={() => setPaymentMethod('visa')}
                                  className="sr-only"
                                />
                                <div className="flex items-center justify-center gap-3">
                                  <div className="text-3xl">💳</div>
                                  <div>
                                    <div className="text-white font-semibold">Visa / Mastercard / Card</div>
                                    <div className="text-gray-400 text-sm">Pay with your bank card</div>
                                  </div>
                                </div>
                              </label>
                            </div>
                            {!paymentMethod && (
                              <p className="text-yellow-400 text-sm mt-3">Please select a payment method to continue</p>
                            )}
                          </div>
                          
                          <button
                            onClick={confirmOrder}
                            disabled={!paymentMethod}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition text-lg"
                          >
                            Confirm Order - ₵{getCartTotal().toFixed(2)}
                          </button>
                        </>
                      ) : (
                        <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-6 text-center">
                          <div className="text-green-400 text-lg font-semibold mb-4">Order Confirmed!</div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-800/50 rounded-lg p-4">
                              <div className="text-gray-400 text-sm mb-1">Order Number</div>
                              <div className="text-xl font-bold text-white">{orderDetails?.orderNumber}</div>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-4">
                              <div className="text-gray-400 text-sm mb-1">Tracking Number</div>
                              <div className="text-xl font-bold text-orange-400">{orderDetails?.trackingNumber}</div>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-4 col-span-2">
                              <div className="text-gray-400 text-sm mb-1">Payment Reference</div>
                              <div className="text-xl font-bold text-yellow-400">{paymentReference}</div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-800/50 rounded-xl p-4 mb-6 text-left">
                            <h4 className="text-white font-semibold mb-3">Payment Instructions</h4>
                            {paymentMethod === 'visa' ? (
                              <>
                                <p className="text-gray-300 mb-2">Please make your payment of <span className="text-green-400 font-bold">₵{getCartTotal().toFixed(2)}</span> using your Visa/Mastercard:</p>
                                <p className="text-gray-400 text-sm mb-2">Enter your card details on the payment page after confirming your order.</p>
                                <p className="text-gray-400 text-sm">Payment Reference: <span className="text-yellow-400 font-mono">{paymentReference}</span></p>
                              </>
                            ) : (
                              <>
                                <p className="text-gray-300 mb-2">Please make your payment of <span className="text-green-400 font-bold">₵{getCartTotal().toFixed(2)}</span> to:</p>
                                <div className="text-3xl font-bold text-white mb-4">0548184293</div>
                                <p className="text-gray-400 text-sm">Use your Payment Reference: <span className="text-yellow-400 font-mono">{paymentReference}</span></p>
                                <p className="text-gray-400 text-sm mt-2">After payment, our team will contact you for delivery within 24-48 hours.</p>
                              </>
                            )}
                          </div>
                          
                          <div className="text-left bg-orange-900/30 rounded-lg p-4 mb-6">
                            <h4 className="text-white font-semibold mb-2">What is Next?</h4>
                            <ul className="text-gray-300 text-sm space-y-1">
                              <li>✓ Save your Order Number: {orderDetails?.orderNumber}</li>
                              <li>✓ Save your Tracking Number: {orderDetails?.trackingNumber}</li>
                              <li>✓ Make payment to complete your order</li>
                              <li>✓ We will contact you after payment confirmation</li>
                            </ul>
                          </div>
                          
                          <button
                            onClick={() => {
                              setCart([]);
                              setShowCheckout(false);
                              setShowPayment(false);
                              setOrderDetails(null);
                              setPaymentReference("");
                              setCustomerForm({ fullName: "", phoneNumber: "", email: "", shippingAddress: "", billingAddress: "", city: "", region: "" });
                              setAppliedPromo(null);
                              setPromoCode("");
                              setPaymentMethod(null);
                              setActiveTab("home");
                            }}
                            className="mt-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-xl transition"
                          >
                            Done
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setShowCheckout(false)}
                      className="text-gray-400 hover:text-white transition"
                    >
                      ← Back to Cart
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Application Tab */}
      {activeTab === "application" && (
        <section className="py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-2">Job Application</h2>
            <p className="text-gray-400 mb-8">Apply to join the RIGHTCLICK COMPUTER DIGITALS team</p>
            
            {appSuccess ? (
              <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-8 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-white font-bold text-xl mb-2">Application Submitted!</h3>
                <p className="text-gray-300 mb-6">Thank you for your interest in joining our team. We will review your application and contact you soon.</p>
                <button
                  onClick={() => setAppSuccess(false)}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-xl transition"
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplicationSubmit} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-6">
                {appError && (
                  <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-red-400">
                    {appError}
                  </div>
                )}
                
                <div>
                  <label className="block text-white font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={appForm.fullName}
                    onChange={(e) => setAppForm({ ...appForm, fullName: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={appForm.phoneNumber}
                    onChange={(e) => setAppForm({ ...appForm, phoneNumber: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={appForm.email}
                    onChange={(e) => setAppForm({ ...appForm, email: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">CV Upload (PDF, DOC, DOCX only)</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setAppForm({ ...appForm, cvFile: e.target.files?.[0] || null })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-600 file:text-white file:cursor-pointer"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={appSubmitting}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-semibold py-4 rounded-xl transition text-lg"
                >
                  {appSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {/* Footer - Only show on home tab */}
      {activeTab === "home" && (
        <footer className="bg-gray-900 border-t border-gray-800 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src="/logo-icon.svg"
                    alt="RightClick Computer Digitals"
                    width={36}
                    height={36}
                    className="w-9 h-9"
                  />
                  <div>
                    <div className="text-white font-bold text-sm">RIGHTCLICK</div>
                    <div className="text-orange-400 text-xs tracking-widest">COMPUTER DIGITALS</div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm italic">&ldquo;We give you options.&rdquo;</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Quick Links</h4>
                <div className="space-y-2">
                  <button onClick={() => setActiveTab("products")} className="block text-gray-400 hover:text-white transition text-sm">
                    Products
                  </button>
                  <button onClick={() => setActiveTab("services")} className="block text-gray-400 hover:text-white transition text-sm">
                    Services
                  </button>
                  <button onClick={() => setActiveTab("application")} className="block text-gray-400 hover:text-white transition text-sm">
                    Apply Now
                  </button>
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Contact Us</h4>
                <div className="space-y-2 text-gray-400 text-sm">
                  <p>📧 info@rightclickdigitals.com</p>
                  <p>📞 Office Line: 0503819000</p>
                  <p>📍 123 Tech Street, Digital City</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-6 text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} RIGHTCLICK COMPUTER DIGITALS. All rights reserved.
            </div>
          </div>
        </footer>
      )}

      {/* AI Chat Widget - available on all pages */}
      <ChatWidget cartItems={cart.map((item: CartItem) => ({ id: item.product.id, name: item.product.name, price: item.product.price }))} />
    </div>
  );
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (product: Product) => void }) {
  const categoryColors: Record<string, string> = {
    laptop: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    desktop: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    accessory: "bg-green-500/10 text-green-400 border-green-500/20",
    part: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    service: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/5 transition group">
      {product.imageUrl && (
        <div className="h-48 overflow-hidden bg-gray-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
          <span className="text-2xl font-bold text-orange-400">₵{product.price.toFixed(2)}</span>
          <button
            onClick={() => onAddToCart(product)}
            className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
