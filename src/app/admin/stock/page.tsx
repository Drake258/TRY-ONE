"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface StockHistory {
  id: number;
  productId: number;
  changeType: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string | null;
  createdAt: string;
  productName: string;
}

interface StockAlert {
  id: number;
  productId: number;
  alertType: string;
  message: string;
  isRead: boolean;
  isResolved: boolean;
  createdAt: string;
  productName: string;
}

export default function StockPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"history" | "alerts">("history");
  const [history, setHistory] = useState<StockHistory[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [adjustForm, setAdjustForm] = useState({ changeType: "restock", quantity: 0, reason: "" });

  const fetchStockData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stock?type=${activeTab}`);
      const data = await res.json();
      if (activeTab === "history") {
        setHistory(data.history || []);
      } else {
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStockData();
  }, [activeTab]);

  const markAlertRead = async (alertId: number) => {
    await fetch("/api/admin/stock", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertId, action: "read" }),
    });
    fetchStockData();
  };

  const resolveAlert = async (alertId: number) => {
    await fetch("/api/admin/stock", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertId, action: "resolve" }),
    });
    fetchStockData();
  };

  const handleStockAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || adjustForm.quantity === 0) return;

    try {
      const res = await fetch("/api/admin/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct,
          changeType: adjustForm.changeType,
          quantity: adjustForm.quantity,
          reason: adjustForm.reason,
        }),
      });

      if (res.ok) {
        setShowAdjustModal(false);
        setAdjustForm({ changeType: "restock", quantity: 0, reason: "" });
        fetchStockData();
      }
    } catch (error) {
      console.error("Error adjusting stock:", error);
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case "sale": return "text-red-600 bg-red-50";
      case "restock": return "text-green-600 bg-green-50";
      case "return": return "text-blue-600 bg-blue-50";
      case "adjustment": return "text-yellow-600 bg-yellow-50";
      case "damage": return "text-gray-600 bg-gray-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case "low_stock": return "text-orange-600 bg-orange-50 border-orange-200";
      case "out_of_stock": return "text-red-600 bg-red-50 border-red-200";
      case "restock_needed": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Stock Management</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "history"
              ? "text-orange-600 border-b-2 border-orange-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Stock History
        </button>
        <button
          onClick={() => setActiveTab("alerts")}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === "alerts"
              ? "text-orange-600 border-b-2 border-orange-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Stock Alerts
          {unreadAlerts > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadAlerts}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      ) : activeTab === "history" ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No stock history yet
                  </td>
                </tr>
              ) : history.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {item.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getChangeTypeColor(item.changeType)}`}>
                      {item.changeType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={item.quantity < 0 ? "text-red-600" : "text-green-600"}>
                      {item.quantity > 0 ? "+" : ""}{item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.previousStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.newStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.reason || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No stock alerts</p>
            </div>
          ) : alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-lg shadow p-4 border-l-4 ${getAlertTypeColor(alert.alertType)} ${
                !alert.isRead ? "ring-2 ring-orange-200" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      alert.alertType === "out_of_stock" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      {alert.alertType.replace("_", " ").toUpperCase()}
                    </span>
                    <span className="font-medium text-gray-800">{alert.productName}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!alert.isRead && (
                    <button
                      onClick={() => markAlertRead(alert.id)}
                      className="px-3 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded"
                    >
                      Mark Read
                    </button>
                  )}
                  {!alert.isResolved && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Adjust Stock</h2>
            <form onSubmit={handleStockAdjust}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                <input
                  type="number"
                  value={selectedProduct || ""}
                  onChange={(e) => setSelectedProduct(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type</label>
                <select
                  value={adjustForm.changeType}
                  onChange={(e) => setAdjustForm({ ...adjustForm, changeType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="restock">Restock (Add)</option>
                  <option value="adjustment">Manual Adjustment</option>
                  <option value="damage">Damage (Remove)</option>
                  <option value="return">Return (Add)</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={adjustForm.quantity}
                  onChange={(e) => setAdjustForm({ ...adjustForm, quantity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
                <input
                  type="text"
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  placeholder="e.g., Monthly restock"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Adjust Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
