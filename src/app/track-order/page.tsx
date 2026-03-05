"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Order status stages
const ORDER_STAGES = [
  { key: "pending", label: "Order Placed", icon: "📝" },
  { key: "received", label: "Order Received", icon: "📋" },
  { key: "confirmed", label: "Payment Confirmed", icon: "✅" },
  { key: "processing", label: "Processing", icon: "⚙️" },
  { key: "packed", label: "Packed", icon: "📦" },
  { key: "shipped", label: "Shipped", icon: "🚚" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: "🏃" },
  { key: "delivered", label: "Delivered", icon: "🎉" },
];

type OrderData = {
  orderNumber: string;
  trackingNumber: string;
  customerName: string;
  customerPhone: string;
  items: string;
  totalAmount: number;
  status: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  estimatedDelivery?: string;
  city?: string;
  region?: string;
  shippingAddress?: string;
};

export default function TrackOrderPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchType, setSearchType] = useState<"order" | "tracking">("order");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchOrder = async () => {
    if (!searchInput.trim()) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/${searchInput}`);
      const data = await res.json();

      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setError(data.error || "Order not found");
      }
    } catch (err) {
      setError("Failed to search order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStageIndex = () => {
    if (!order) return -1;
    const status = order.orderStatus || order.status;
    return ORDER_STAGES.findIndex((s) => s.key === status);
  };

  const isStageComplete = (index: number) => {
    return index < getCurrentStageIndex();
  };

  const isStageCurrent = (index: number) => {
    return index === getCurrentStageIndex();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const parseItems = (itemsString: string) => {
    try {
      return JSON.parse(itemsString);
    } catch {
      return [];
    }
  };

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
            <Link
              href="/"
              className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Track Your Order</h1>
          <p className="text-gray-400">
            Enter your order number or tracking number to see the status of your order
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2 mb-4 md:mb-0">
              <button
                onClick={() => setSearchType("order")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  searchType === "order"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Order Number
              </button>
              <button
                onClick={() => setSearchType("tracking")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  searchType === "tracking"
                    ? "bg-orange-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Tracking Number
              </button>
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              placeholder={searchType === "order" ? "e.g., ORD-ABC123" : "e.g., TRK-XYZ789"}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              onKeyDown={(e) => e.key === "Enter" && searchOrder()}
            />
            <button
              onClick={searchOrder}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white font-medium px-6 py-3 rounded-lg transition"
            >
              {loading ? "Searching..." : "Track Order"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl mb-8">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Order Number</div>
                <div className="text-white font-bold text-lg">{order.orderNumber}</div>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Tracking Number</div>
                <div className="text-orange-400 font-bold text-lg">{order.trackingNumber}</div>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Total Amount</div>
                <div className="text-white font-bold text-lg">₵{order.totalAmount.toFixed(2)}</div>
              </div>
            </div>

            {/* Tracking Progress */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Order Status</h2>
              
              {/* Progress Bar */}
              <div className="relative mb-8">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-700 -translate-y-1/2 rounded-full">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${(getCurrentStageIndex() / (ORDER_STAGES.length - 1)) * 100}%`,
                    }}
                  />
                </div>
                <div className="relative flex justify-between">
                  {ORDER_STAGES.map((stage, index) => (
                    <div
                      key={stage.key}
                      className={`flex flex-col items-center ${index <= getCurrentStageIndex() ? "text-orange-400" : "text-gray-500"}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-2 transition-all ${
                          isStageComplete(index)
                            ? "bg-orange-600 text-white"
                            : isStageCurrent(index)
                            ? "bg-orange-600 text-white ring-4 ring-orange-500/30"
                            : "bg-gray-700 text-gray-400"
                        }`}
                      >
                        {isStageComplete(index) ? "✓" : stage.icon}
                      </div>
                      <span className="text-xs text-center hidden sm:block max-w-[80px]">{stage.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Status Message */}
              <div className="text-center bg-orange-600/10 border border-orange-500/20 rounded-xl p-4">
                <div className="text-orange-400 font-semibold">
                  {ORDER_STAGES[getCurrentStageIndex()]?.icon}{" "}
                  {ORDER_STAGES[getCurrentStageIndex()]?.label}
                </div>
                {order.estimatedDelivery && getCurrentStageIndex() >= 5 && (
                  <div className="text-gray-400 text-sm mt-1">
                    Estimated delivery: {formatDate(order.estimatedDelivery)}
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Order Items</h2>
              <div className="space-y-3">
                {parseItems(order.items).map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-900/50 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
                        📦
                      </div>
                      <div>
                        <div className="text-white font-medium">{item.name}</div>
                        <div className="text-gray-400 text-sm">Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <div className="text-orange-400 font-semibold">
                      ₵{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Details */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Delivery Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Customer Name</div>
                  <div className="text-white">{order.customerName}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Phone</div>
                  <div className="text-white">{order.customerPhone}</div>
                </div>
                {order.shippingAddress && (
                  <div className="md:col-span-2">
                    <div className="text-gray-400 text-sm">Shipping Address</div>
                    <div className="text-white">{order.shippingAddress}</div>
                  </div>
                )}
                {order.city && (
                  <div>
                    <div className="text-gray-400 text-sm">City</div>
                    <div className="text-white">{order.city}</div>
                  </div>
                )}
                {order.region && (
                  <div>
                    <div className="text-gray-400 text-sm">Region</div>
                    <div className="text-white">{order.region}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Payment Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Payment Method</div>
                  <div className="text-white capitalize">{order.paymentMethod || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Payment Status</div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      order.paymentStatus === "paid"
                        ? "bg-green-500/10 text-green-400"
                        : order.paymentStatus === "pending"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {order.paymentStatus === "paid" ? "✓ Paid" : "Pending"}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <div className="text-gray-400 text-sm">Order Date</div>
                  <div className="text-white">{formatDate(order.createdAt)}</div>
                </div>
              </div>
            </div>
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
