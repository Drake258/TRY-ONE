"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  orderNumber: string;
  trackingNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  shippingAddress: string | null;
  billingAddress: string | null;
  city: string | null;
  region: string | null;
  items: string;
  totalAmount: number;
  discount: number | null;
  promoCode: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  paymentReference: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirmPayment, setShowConfirmPayment] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [actionNote, setActionNote] = useState("");

  // Load order on mount
  useEffect(() => {
    let mounted = true;
    const orderNumber = params.orderNumber;
    if (orderNumber) {
      fetch(`/api/orders/${orderNumber}`)
        .then((res) => res.json())
        .then((data) => {
          if (mounted && data.order) {
            setOrder(data.order);
          }
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    } else {
      // Use setTimeout to defer the setState call
      const timeoutId = setTimeout(() => {
        if (mounted) setLoading(false);
      }, 0);
      return () => {
        clearTimeout(timeoutId);
        mounted = false;
      };
    }
    return () => { mounted = false; };
  }, [params.orderNumber]);

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    if (!order) return;
    setSaving(true);
    
    try {
      const res = await fetch(`/api/orders/${order.orderNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes: actionNote }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
        }
        setActionNote("");
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
    
    setSaving(false);
  };

  const confirmPayment = async () => {
    if (!order) return;
    setSaving(true);
    
    try {
      const res = await fetch(`/api/orders/${order.orderNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          paymentStatus: "paid",
          status: "processing",
          notes: actionNote || "Payment confirmed manually by admin" 
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
        }
        setShowConfirmPayment(false);
        setActionNote("");
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
    }
    
    setSaving(false);
  };

  const processRefund = async () => {
    if (!order) return;
    setSaving(true);
    
    try {
      const res = await fetch(`/api/orders/${order.orderNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          paymentStatus: "refunded",
          status: "cancelled",
          notes: actionNote || "Refund processed by admin" 
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
        }
        setShowRefund(false);
        setActionNote("");
      }
    } catch (error) {
      console.error("Error processing refund:", error);
    }
    
    setSaving(false);
  };

  const generateInvoice = () => {
    if (!order) return;
    
    let items: OrderItem[] = [];
    try {
      items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
    } catch (e) {
      items = [];
    }

    const invoiceContent = `
=====================================
   RIGHTCLICK COMPUTER DIGITALS
=====================================

INVOICE
Invoice #: ${order.orderNumber}
Date: ${new Date(order.createdAt).toLocaleDateString()}

-------------------------------------
CUSTOMER DETAILS
-------------------------------------
Name: ${order.customerName}
Phone: ${order.customerPhone}
${order.customerEmail ? `Email: ${order.customerEmail}` : ""}
${order.city ? `City: ${order.city}` : ""}
${order.region ? `Region: ${order.region}` : ""}
${order.shippingAddress ? `Shipping Address: ${order.shippingAddress}` : ""}

-------------------------------------
ORDER DETAILS
-------------------------------------
Order #: ${order.orderNumber}
Tracking #: ${order.trackingNumber}
${order.paymentReference ? `Payment Ref: ${order.paymentReference}` : ""}

-------------------------------------
ITEMS
-------------------------------------
${items.map((item) => `${item.name} x${item.quantity}.....₵${(item.price * item.quantity).toFixed(2)}`).join("\n")}

-------------------------------------
PAYMENT SUMMARY
-------------------------------------
Subtotal: ₵${Number(order.totalAmount + (order.discount || 0)).toFixed(2)}
${order.discount && order.discount > 0 ? `Discount (${order.promoCode}): -₵${Number(order.discount).toFixed(2)}` : ""}
TOTAL: ₵${Number(order.totalAmount).toFixed(2)}

Payment Status: ${order.paymentStatus.toUpperCase()}
Payment Method: ${order.paymentMethod || "N/A"}
Order Status: ${order.status.toUpperCase()}

=====================================
    Thank you for your business!
    RIGHTCLICK COMPUTER DIGITALS
    Phone: 0503819000 / 0548184293
=====================================
    `.trim();

    // Create and download file
    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${order.orderNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    processing: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    delivered: "bg-green-500/10 text-green-400 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const paymentStatusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    paid: "bg-green-500/10 text-green-400 border-green-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    refunded: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold text-white mb-2">Order Not Found</h2>
        <p className="text-gray-400 mb-6">The order you are looking for does not exist.</p>
        <button
          onClick={() => router.push("/admin/orders")}
          className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg transition"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  let items: OrderItem[] = [];
  try {
    items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
  } catch (e) {
    items = [];
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/orders")}
            className="text-gray-400 hover:text-white transition"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Order #{order.orderNumber}</h1>
            <p className="text-gray-400">Tracking: {order.trackingNumber}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generateInvoice}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            📄 Generate Invoice
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Order Status</div>
          <div className={`mt-2 text-lg font-semibold capitalize px-3 py-1 rounded-lg border inline-block ${statusColors[order.status]}`}>
            {order.status}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Payment Status</div>
          <div className={`mt-2 text-lg font-semibold capitalize px-3 py-1 rounded-lg border inline-block ${paymentStatusColors[order.paymentStatus]}`}>
            {order.paymentStatus}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Payment Method</div>
          <div className="text-white font-semibold mt-2 capitalize">
            {order.paymentMethod || "Not specified"}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Total Amount</div>
          <div className="text-2xl font-bold text-green-400 mt-1">
            ₵{Number(order.totalAmount).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Details */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Customer Details</h2>
          <div className="space-y-3">
            <div>
              <div className="text-gray-500 text-sm">Name</div>
              <div className="text-white">{order.customerName}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Phone</div>
              <div className="text-white">{order.customerPhone}</div>
            </div>
            {order.customerEmail && (
              <div>
                <div className="text-gray-500 text-sm">Email</div>
                <div className="text-white">{order.customerEmail}</div>
              </div>
            )}
            {order.city && (
              <div>
                <div className="text-gray-500 text-sm">City</div>
                <div className="text-white">{order.city}</div>
              </div>
            )}
            {order.region && (
              <div>
                <div className="text-gray-500 text-sm">Region</div>
                <div className="text-white">{order.region}</div>
              </div>
            )}
            {order.shippingAddress && (
              <div>
                <div className="text-gray-500 text-sm">Shipping Address</div>
                <div className="text-white">{order.shippingAddress}</div>
              </div>
            )}
            {order.billingAddress && (
              <div>
                <div className="text-gray-500 text-sm">Billing Address</div>
                <div className="text-white">{order.billingAddress}</div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 lg:col-span-2">
          <h2 className="text-white font-semibold mb-4">Order Items</h2>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                <div>
                  <div className="text-white">{item.name}</div>
                  <div className="text-gray-500 text-sm">₵{item.price.toFixed(2)} x {item.quantity}</div>
                </div>
                <div className="text-white font-semibold">
                  ₵{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="flex justify-between text-gray-400 mb-2">
              <span>Subtotal</span>
              <span>₵{(Number(order.totalAmount) + (order.discount || 0)).toFixed(2)}</span>
            </div>
            {order.discount && order.discount > 0 && (
              <div className="flex justify-between text-green-400 mb-2">
                <span>Discount ({order.promoCode})</span>
                <span>-₵{Number(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-white font-bold text-lg">
              <span>Total</span>
              <span>₵{Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Reference */}
          {order.paymentReference && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="text-gray-500 text-sm">Payment Reference</div>
              <div className="text-yellow-400 font-mono">{order.paymentReference}</div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Admin Actions</h2>
        
        {/* Payment Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          {order.paymentStatus === "pending" && (
            <button
              onClick={() => setShowConfirmPayment(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              ✓ Confirm Payment
            </button>
          )}
          {order.paymentStatus === "paid" && order.status !== "cancelled" && (
            <button
              onClick={() => setShowRefund(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              ↩️ Process Refund
            </button>
          )}
        </div>

        {/* Status Update */}
        <div className="border-t border-gray-800 pt-6">
          <h3 className="text-white font-medium mb-4">Update Order Status</h3>
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => updateOrderStatus("confirmed")}
              disabled={saving || order.status === "confirmed"}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
            >
              Confirm
            </button>
            <button
              onClick={() => updateOrderStatus("processing")}
              disabled={saving || order.status === "processing"}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
            >
              Processing
            </button>
            <button
              onClick={() => updateOrderStatus("shipped")}
              disabled={saving || order.status === "shipped"}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
            >
              Shipped
            </button>
            <button
              onClick={() => updateOrderStatus("delivered")}
              disabled={saving || order.status === "delivered"}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
            >
              Delivered
            </button>
            <button
              onClick={() => updateOrderStatus("cancelled")}
              disabled={saving || order.status === "cancelled"}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
          
          {/* Notes */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Add Note</label>
            <textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="Add a note about this order..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-violet-500 focus:outline-none"
              rows={2}
            />
          </div>
        </div>

        {/* Current Notes */}
        {order.notes && (
          <div className="mt-6 pt-6 border-t border-gray-800">
            <h3 className="text-white font-medium mb-2">Order Notes</h3>
            <p className="text-gray-400">{order.notes}</p>
          </div>
        )}
      </div>

      {/* Confirm Payment Modal */}
      {showConfirmPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-white font-bold text-xl mb-4">Confirm Payment</h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to confirm payment for this order?
            </p>
            <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 mb-4">
              <div className="text-white font-semibold">Order: {order.orderNumber}</div>
              <div className="text-green-400 text-2xl font-bold">₵{Number(order.totalAmount).toFixed(2)}</div>
            </div>
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Note (Optional)</label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Add a note..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-violet-500 focus:outline-none"
                rows={2}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmPayment(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg transition"
              >
                {saving ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefund && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-white font-bold text-xl mb-4">Process Refund</h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to process a refund for this order?
            </p>
            <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-4">
              <div className="text-white font-semibold">Order: {order.orderNumber}</div>
              <div className="text-red-400 text-2xl font-bold">₵{Number(order.totalAmount).toFixed(2)}</div>
            </div>
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Reason for Refund *</label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Enter reason for refund..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-violet-500 focus:outline-none"
                rows={2}
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRefund(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={processRefund}
                disabled={saving || !actionNote}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg transition"
              >
                {saving ? "Processing..." : "Process Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
