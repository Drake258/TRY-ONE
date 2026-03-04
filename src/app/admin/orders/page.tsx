import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc, and, gte, lte, like, or } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    paymentStatus?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

async function getOrders(filters: {
  status?: string;
  paymentStatus?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const conditions = [];
  
  if (filters.status) {
    conditions.push(eq(orders.status, filters.status as OrderStatus));
  }
  if (filters.paymentStatus) {
    conditions.push(eq(orders.paymentStatus, filters.paymentStatus as PaymentStatus));
  }
  if (filters.search) {
    conditions.push(
      or(
        like(orders.customerName, `%${filters.search}%`),
        like(orders.customerPhone, `%${filters.search}%`),
        like(orders.orderNumber, `%${filters.search}%`),
        like(orders.trackingNumber, `%${filters.search}%`)
      )
    );
  }
  if (filters.dateFrom) {
    conditions.push(gte(orders.createdAt, new Date(filters.dateFrom)));
  }
  if (filters.dateTo) {
    conditions.push(lte(orders.createdAt, new Date(filters.dateTo + "T23:59:59")));
  }
  
  const query = conditions.length > 0 
    ? db.select().from(orders).where(and(...conditions)).orderBy(desc(orders.createdAt))
    : db.select().from(orders).orderBy(desc(orders.createdAt));
    
  return await query;
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const allOrders = await getOrders({
    status: params.status,
    paymentStatus: params.paymentStatus,
    search: params.search,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  });

  // Calculate stats
  const stats = {
    total: allOrders.length,
    pending: allOrders.filter(o => o.paymentStatus === "pending").length,
    paid: allOrders.filter(o => o.paymentStatus === "paid").length,
    shipped: allOrders.filter(o => o.status === "shipped").length,
    delivered: allOrders.filter(o => o.status === "delivered").length,
    totalRevenue: allOrders
      .filter(o => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0),
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders & Transactions</h1>
          <p className="text-gray-400">Manage customer orders and payments</p>
        </div>
        <form method="GET" className="flex gap-2">
          <input
            type="text"
            name="search"
            defaultValue={params.search || ""}
            placeholder="Search orders..."
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
          />
          <select
            name="status"
            defaultValue={params.status || ""}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-violet-500 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            name="paymentStatus"
            defaultValue={params.paymentStatus || ""}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-violet-500 focus:outline-none"
          >
            <option value="">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <button
            type="submit"
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Total Orders</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-yellow-400 text-sm">Pending Payment</div>
          <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-green-400 text-sm">Paid</div>
          <div className="text-2xl font-bold text-green-400">{stats.paid}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-purple-400 text-sm">Shipped</div>
          <div className="text-2xl font-bold text-purple-400">{stats.shipped}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-violet-400 text-sm">Delivered</div>
          <div className="text-2xl font-bold text-violet-400">{stats.delivered}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-gray-400 text-sm">Revenue</div>
          <div className="text-2xl font-bold text-green-400">₵{stats.totalRevenue.toFixed(2)}</div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <form method="GET" className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">From Date</label>
            <input
              type="date"
              name="dateFrom"
              defaultValue={params.dateFrom || ""}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">To Date</label>
            <input
              type="date"
              name="dateTo"
              defaultValue={params.dateTo || ""}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition"
            >
              Apply Date Filter
            </button>
            <Link
              href="/admin/orders"
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
            >
              Clear
            </Link>
          </div>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Order #</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Customer</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Items</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Total</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Status</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Payment</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Date</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400 py-12">
                    No orders found
                  </td>
                </tr>
              ) : (
                allOrders.map((order) => {
                  let items: Array<{ name: string; quantity: number }> = [];
                  try {
                    items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
                  } catch (e) {
                    items = [];
                  }
                  
                  return (
                    <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{order.orderNumber}</div>
                        <div className="text-gray-500 text-xs">{order.trackingNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">{order.customerName}</div>
                        <div className="text-gray-500 text-xs">{order.customerPhone}</div>
                        {order.customerEmail && (
                          <div className="text-gray-500 text-xs">{order.customerEmail}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {items.slice(0, 2).map((item, i) => (
                          <div key={i} className="text-sm">
                            {item.name} x{item.quantity}
                          </div>
                        ))}
                        {items.length > 2 && (
                          <div className="text-gray-500 text-xs">+{items.length - 2} more</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-semibold">₵{Number(order.totalAmount).toFixed(2)}</div>
                        {order.discount && order.discount > 0 && (
                          <div className="text-green-400 text-xs">-₵{Number(order.discount).toFixed(2)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-3 py-1 rounded-full border capitalize ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-3 py-1 rounded-full border capitalize ${paymentStatusColors[order.paymentStatus]}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`/admin/orders/${order.orderNumber}`}
                          className="text-violet-400 hover:text-violet-300 text-sm"
                        >
                          View Details
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Export Reports</h3>
        <div className="flex gap-4">
          <a
            href={`/api/admin/export?type=orders&format=csv${params.status ? `&status=${params.status}` : ''}${params.paymentStatus ? `&paymentStatus=${params.paymentStatus}` : ''}`}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            📊 Export CSV
          </a>
          <a
            href={`/api/admin/export?type=orders&format=json${params.status ? `&status=${params.status}` : ''}${params.paymentStatus ? `&paymentStatus=${params.paymentStatus}` : ''}`}
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            📋 Export JSON
          </a>
        </div>
      </div>
    </div>
  );
}
