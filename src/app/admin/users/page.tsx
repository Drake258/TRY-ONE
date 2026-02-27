import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import UserActions from "@/components/admin/UserActions";

async function getUsers() {
  return await db.select({
    id: users.id,
    username: users.username,
    role: users.role,
    status: users.status,
    createdAt: users.createdAt,
    lastLogin: users.lastLogin,
  }).from(users).orderBy(desc(users.createdAt));
}

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") redirect("/admin");

  const allUsers = await getUsers();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-1">{allUsers.length} total users</p>
        </div>
        <Link
          href="/admin/users/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition flex items-center gap-2"
        >
          <span>+</span> Create User
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Users", value: allUsers.length, color: "blue" },
          { label: "Admin Users", value: allUsers.filter(u => u.role === "admin").length, color: "yellow" },
          { label: "Active Users", value: allUsers.filter(u => u.status === "active").length, color: "green" },
        ].map((card) => {
          const colors: Record<string, string> = {
            blue: "border-blue-500/20 bg-blue-600/10",
            yellow: "border-yellow-500/20 bg-yellow-600/10",
            green: "border-green-500/20 bg-green-600/10",
          };
          const textColors: Record<string, string> = {
            blue: "text-blue-400",
            yellow: "text-yellow-400",
            green: "text-green-400",
          };
          return (
            <div key={card.label} className={`border rounded-xl p-4 ${colors[card.color]}`}>
              <div className={`text-2xl font-bold ${textColors[card.color]}`}>{card.value}</div>
              <div className="text-gray-400 text-sm">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">User</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Role</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Status</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Last Login</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Created</th>
                <th className="text-right text-gray-400 text-sm font-medium px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{user.username[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{user.username}</div>
                        <div className="text-gray-500 text-xs">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                      user.role === "admin"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-blue-500/10 text-blue-400"
                    }`}>
                      {user.role === "admin" ? "🛡️ " : "👤 "}{user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.status === "active"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}>
                      {user.status === "active" ? "● Active" : "● Suspended"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <UserActions
                      userId={user.id}
                      currentStatus={user.status}
                      currentRole={user.role}
                      currentUserId={session.user.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
