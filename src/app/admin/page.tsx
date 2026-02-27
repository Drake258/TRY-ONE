import { db } from "@/db";
import { users, products, activityLogs } from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

async function getDashboardStats() {
  const [totalUsers] = await db.select({ count: count() }).from(users);
  const [totalProducts] = await db.select({ count: count() }).from(products);
  const [inStockProducts] = await db.select({ count: count() }).from(products).where(eq(products.inStock, true));
  const [activeUsers] = await db.select({ count: count() }).from(users).where(eq(users.status, "active"));
  const [adminUsers] = await db.select({ count: count() }).from(users).where(eq(users.role, "admin"));
  const [staffUsers] = await db.select({ count: count() }).from(users).where(eq(users.role, "staff"));

  const categoryStats = await db
    .select({ category: products.category, count: count() })
    .from(products)
    .groupBy(products.category);

  const recentLogs = await db
    .select()
    .from(activityLogs)
    .orderBy(desc(activityLogs.createdAt))
    .limit(10);

  const recentProducts = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt))
    .limit(5);

  return {
    totalUsers: totalUsers.count,
    totalProducts: totalProducts.count,
    inStockProducts: inStockProducts.count,
    activeUsers: activeUsers.count,
    adminUsers: adminUsers.count,
    staffUsers: staffUsers.count,
    categoryStats,
    recentLogs,
    recentProducts,
  };
}

export default async function AdminDashboard() {
  const session = await getSession();
  const stats = await getDashboardStats();

  const statCards = [
    { label: "Total Products", value: stats.totalProducts, icon: "🖥️", color: "blue", sub: `${stats.inStockProducts} in stock` },
    { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "purple", sub: `${stats.activeUsers} active` },
    { label: "Admin Users", value: stats.adminUsers, icon: "🛡️", color: "yellow", sub: `${stats.staffUsers} staff` },
    { label: "In Stock Items", value: stats.inStockProducts, icon: "📦", color: "green", sub: `${stats.totalProducts - stats.inStockProducts} out of stock` },
  ];

  const colorMap: Record<string, string> = {
    blue: "from-blue-600/20 to-blue-800/10 border-blue-500/20",
    purple: "from-purple-600/20 to-purple-800/10 border-purple-500/20",
    yellow: "from-yellow-600/20 to-yellow-800/10 border-yellow-500/20",
    green: "from-green-600/20 to-green-800/10 border-green-500/20",
  };

  const iconBg: Record<string, string> = {
    blue: "bg-blue-600/20 text-blue-400",
    purple: "bg-purple-600/20 text-purple-400",
    yellow: "bg-yellow-600/20 text-yellow-400",
    green: "bg-green-600/20 text-green-400",
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Welcome back, <span className="text-blue-400 font-medium">{session?.user.username}</span>!
          Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className={`bg-gradient-to-br ${colorMap[card.color]} border rounded-2xl p-5`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${iconBg[card.color]}`}>
                {card.icon}
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{card.value}</div>
            <div className="text-gray-300 text-sm font-medium">{card.label}</div>
            <div className="text-gray-500 text-xs mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category Breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold text-lg mb-4">Products by Category</h2>
          <div className="space-y-3">
            {stats.categoryStats.length === 0 ? (
              <p className="text-gray-500 text-sm">No products yet</p>
            ) : (
              stats.categoryStats.map((cat) => {
                const pct = stats.totalProducts > 0 ? Math.round((cat.count / stats.totalProducts) * 100) : 0;
                const catColors: Record<string, string> = {
                  laptop: "bg-blue-500",
                  desktop: "bg-purple-500",
                  accessory: "bg-green-500",
                  part: "bg-yellow-500",
                  service: "bg-orange-500",
                };
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-300 text-sm capitalize">{cat.category}</span>
                      <span className="text-gray-400 text-sm">{cat.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${catColors[cat.category] || "bg-gray-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">Recent Products</h2>
            <a href="/admin/products" className="text-blue-400 hover:text-blue-300 text-sm transition">View all →</a>
          </div>
          <div className="space-y-3">
            {stats.recentProducts.length === 0 ? (
              <p className="text-gray-500 text-sm">No products yet</p>
            ) : (
              stats.recentProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <div className="text-white text-sm font-medium">{product.name}</div>
                    <div className="text-gray-500 text-xs capitalize">{product.category}</div>
                  </div>
                  <div className="text-blue-400 font-semibold text-sm">${product.price.toFixed(2)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">Recent Activity</h2>
          {session?.user.role === "admin" && (
            <a href="/admin/logs" className="text-blue-400 hover:text-blue-300 text-sm transition">View all →</a>
          )}
        </div>
        <div className="space-y-2">
          {stats.recentLogs.length === 0 ? (
            <p className="text-gray-500 text-sm">No activity yet</p>
          ) : (
            stats.recentLogs.map((log) => {
              const actionColors: Record<string, string> = {
                LOGIN_SUCCESS: "text-green-400",
                LOGIN_FAILED: "text-red-400",
                LOGIN_BLOCKED: "text-red-500",
                LOGOUT: "text-gray-400",
                CREATE: "text-blue-400",
                UPDATE: "text-yellow-400",
                DELETE: "text-red-400",
              };
              return (
                <div key={log.id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium ${actionColors[log.action] || "text-gray-300"}`}>
                      {log.action}
                    </span>
                    <span className="text-gray-400 text-sm"> — {log.resource}</span>
                    {log.username && <span className="text-gray-500 text-xs ml-2">by {log.username}</span>}
                  </div>
                  <div className="text-gray-600 text-xs flex-shrink-0">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
