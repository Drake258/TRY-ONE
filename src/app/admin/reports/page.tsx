import { db } from "@/db";
import { products, users, activityLogs, orders } from "@/db/schema";
import { eq, count, sql, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ExportButtons from "@/components/admin/ExportButtons";

async function getReportData() {
  const [totalProducts] = await db.select({ count: count() }).from(products);
  const [inStock] = await db.select({ count: count() }).from(products).where(eq(products.inStock, true));
  const [outOfStock] = await db.select({ count: count() }).from(products).where(eq(products.inStock, false));
  const [featured] = await db.select({ count: count() }).from(products).where(eq(products.featured, true));

  const categoryBreakdown = await db
    .select({ category: products.category, count: count(), avgPrice: sql<number>`avg(${products.price})` })
    .from(products)
    .groupBy(products.category);

  const [totalUsers] = await db.select({ count: count() }).from(users);
  const [activeUsers] = await db.select({ count: count() }).from(users).where(eq(users.status, "active"));
  const [adminCount] = await db.select({ count: count() }).from(users).where(eq(users.role, "admin"));

  const [totalLogs] = await db.select({ count: count() }).from(activityLogs);
  const [loginSuccess] = await db.select({ count: count() }).from(activityLogs).where(eq(activityLogs.action, "LOGIN_SUCCESS"));
  const [loginFailed] = await db.select({ count: count() }).from(activityLogs).where(eq(activityLogs.action, "LOGIN_FAILED"));

  const allProducts = await db.select().from(products);
  const totalValue = allProducts.reduce((sum, p) => sum + p.price, 0);

  // Sales analytics
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const totalRevenue = allOrders.reduce((sum, o) => sum + (o.paymentStatus === "paid" ? o.totalAmount : 0), 0);
  const pendingPayments = allOrders.filter(o => o.paymentStatus === "pending").reduce((sum, o) => sum + o.totalAmount, 0);
  
  // Orders by status
  const ordersByStatus = {
    pending: allOrders.filter(o => o.status === "pending").length,
    confirmed: allOrders.filter(o => o.status === "confirmed").length,
    processing: allOrders.filter(o => o.status === "processing").length,
    shipped: allOrders.filter(o => o.status === "shipped").length,
    delivered: allOrders.filter(o => o.status === "delivered").length,
    cancelled: allOrders.filter(o => o.status === "cancelled").length,
  };

  // Orders by payment status
  const ordersByPayment = {
    pending: allOrders.filter(o => o.paymentStatus === "pending").length,
    paid: allOrders.filter(o => o.paymentStatus === "paid").length,
    failed: allOrders.filter(o => o.paymentStatus === "failed").length,
    refunded: allOrders.filter(o => o.paymentStatus === "refunded").length,
  };

  // Recent orders (last 10)
  const recentOrders = allOrders.slice(0, 10);

  // Daily sales (last 7 days)
  const today = new Date();
  const dailySales: { date: string; orders: number; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    const dayOrders = allOrders.filter(o => {
      const orderDate = new Date(o.createdAt!);
      return orderDate >= dayStart && orderDate <= dayEnd && o.paymentStatus === "paid";
    });
    
    dailySales.push({
      date: dayStart.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" }),
      orders: dayOrders.length,
      revenue: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    });
  }

  return {
    products: {
      total: totalProducts.count,
      inStock: inStock.count,
      outOfStock: outOfStock.count,
      featured: featured.count,
      totalValue,
      categoryBreakdown,
    },
    users: {
      total: totalUsers.count,
      active: activeUsers.count,
      admins: adminCount.count,
    },
    activity: {
      total: totalLogs.count,
      loginSuccess: loginSuccess.count,
      loginFailed: loginFailed.count,
    },
    sales: {
      totalOrders: allOrders.length,
      totalRevenue,
      pendingPayments,
      ordersByStatus,
      ordersByPayment,
      recentOrders,
      dailySales,
    },
  };
}

export default async function ReportsPage() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") redirect("/admin");

  const data = await getReportData();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-gray-400 mt-1">System overview and data export tools</p>
        </div>
        <ExportButtons />
      </div>

      {/* Product Reports */}
      <div className="mb-8">
        <h2 className="text-white font-semibold text-xl mb-4">📦 Product Analytics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Products", value: data.products.total, color: "blue" },
            { label: "In Stock", value: data.products.inStock, color: "green" },
            { label: "Out of Stock", value: data.products.outOfStock, color: "red" },
            { label: "Featured", value: data.products.featured, color: "yellow" },
          ].map((stat) => {
            const colors: Record<string, string> = {
              blue: "border-orange-500/20 bg-orange-600/10 text-orange-400",
              green: "border-green-500/20 bg-green-600/10 text-green-400",
              red: "border-red-500/20 bg-red-600/10 text-red-400",
              yellow: "border-yellow-500/20 bg-yellow-600/10 text-yellow-400",
            };
            return (
              <div key={stat.label} className={`border rounded-xl p-4 ${colors[stat.color]}`}>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-medium mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {data.products.categoryBreakdown.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm capitalize">{cat.category}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">{cat.count} items</span>
                    <span className="text-orange-400 text-sm font-medium">₵{Number(cat.avgPrice).toFixed(2)} avg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-medium mb-4">Inventory Value</h3>
            <div className="text-4xl font-bold text-orange-400 mb-2">₵{data.products.totalValue.toFixed(2)}</div>
            <div className="text-gray-400 text-sm">Total catalog value</div>
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Avg. product price</span>
                <span className="text-white">₵{data.products.total > 0 ? (data.products.totalValue / data.products.total).toFixed(2) : "0.00"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Reports */}
      <div className="mb-8">
        <h2 className="text-white font-semibold text-xl mb-4">👥 User Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Users", value: data.users.total, sub: "All registered users" },
            { label: "Active Users", value: data.users.active, sub: "Currently active accounts" },
            { label: "Admin Users", value: data.users.admins, sub: "Users with admin access" },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-300 text-sm font-medium">{stat.label}</div>
              <div className="text-gray-500 text-xs mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Reports */}
      <div className="mb-8">
        <h2 className="text-white font-semibold text-xl mb-4">📋 Activity Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Events", value: data.activity.total, color: "text-white" },
            { label: "Successful Logins", value: data.activity.loginSuccess, color: "text-green-400" },
            { label: "Failed Logins", value: data.activity.loginFailed, color: "text-red-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className={`text-3xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sales Analytics */}
      <div className="mb-8">
        <h2 className="text-white font-semibold text-xl mb-4">💰 Sales Analytics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Orders", value: data.sales.totalOrders, color: "blue" },
            { label: "Total Revenue", value: `₵${data.sales.totalRevenue.toFixed(2)}`, color: "green" },
            { label: "Pending Payments", value: `₵${data.sales.pendingPayments.toFixed(2)}`, color: "yellow" },
            { label: "Paid Orders", value: data.sales.ordersByPayment.paid, color: "green" },
          ].map((stat) => {
            const colors: Record<string, string> = {
              blue: "border-orange-500/20 bg-orange-600/10 text-orange-400",
              green: "border-green-500/20 bg-green-600/10 text-green-400",
              yellow: "border-yellow-500/20 bg-yellow-600/10 text-yellow-400",
              red: "border-red-500/20 bg-red-600/10 text-red-400",
            };
            return (
              <div key={stat.label} className={`border rounded-xl p-4 ${colors[stat.color]}`}>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Daily Sales Chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-medium mb-4">📈 Daily Sales (Last 7 Days)</h3>
            <div className="space-y-3">
              {data.sales.dailySales.map((day: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">{day.date}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">{day.orders} orders</span>
                    <span className="text-orange-400 text-sm font-medium">₵{day.revenue.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Orders by Status */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-medium mb-4">📦 Orders by Status</h3>
            <div className="space-y-3">
              {Object.entries(data.sales.ordersByStatus).map(([status, count]) => {
                const statusColors: Record<string, string> = {
                  pending: "text-yellow-400",
                  confirmed: "text-blue-400",
                  processing: "text-purple-400",
                  shipped: "text-orange-400",
                  delivered: "text-green-400",
                  cancelled: "text-red-400",
                };
                return (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm capitalize">{status}</span>
                    <span className={`font-medium ${statusColors[status] || "text-white"}`}>
                      {count as number}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-medium mb-4">🛒 Recent Orders</h3>
          {data.sales.recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-2 text-gray-400">Order #</th>
                    <th className="text-left py-3 px-2 text-gray-400">Customer</th>
                    <th className="text-left py-3 px-2 text-gray-400">Amount</th>
                    <th className="text-left py-3 px-2 text-gray-400">Status</th>
                    <th className="text-left py-3 px-2 text-gray-400">Payment</th>
                    <th className="text-left py-3 px-2 text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sales.recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-gray-800/50">
                      <td className="py-3 px-2 text-orange-400 font-medium">{order.orderNumber}</td>
                      <td className="py-3 px-2 text-gray-300">{order.customerName}</td>
                      <td className="py-3 px-2 text-white font-medium">₵{Number(order.totalAmount).toFixed(2)}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === 'delivered' ? 'bg-green-900 text-green-400' :
                          order.status === 'shipped' ? 'bg-orange-900 text-orange-400' :
                          order.status === 'processing' ? 'bg-purple-900 text-purple-400' :
                          order.status === 'confirmed' ? 'bg-blue-900 text-blue-400' :
                          order.status === 'cancelled' ? 'bg-red-900 text-red-400' :
                          'bg-yellow-900 text-yellow-400'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.paymentStatus === 'paid' ? 'bg-green-900 text-green-400' :
                          order.paymentStatus === 'refunded' ? 'bg-purple-900 text-purple-400' :
                          order.paymentStatus === 'failed' ? 'bg-red-900 text-red-400' :
                          'bg-yellow-900 text-yellow-400'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
