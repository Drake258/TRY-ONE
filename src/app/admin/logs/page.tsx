import { db } from "@/db";
import { activityLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

async function getLogs() {
  return await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(200);
}

export default async function ActivityLogsPage() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") redirect("/admin");

  const logs = await getLogs();

  const actionColors: Record<string, string> = {
    LOGIN_SUCCESS: "bg-green-500/10 text-green-400",
    LOGIN_FAILED: "bg-red-500/10 text-red-400",
    LOGIN_BLOCKED: "bg-red-600/10 text-red-500",
    LOGOUT: "bg-gray-700 text-gray-400",
    CREATE: "bg-orange-500/10 text-orange-400",
    UPDATE: "bg-yellow-500/10 text-yellow-400",
    DELETE: "bg-red-500/10 text-red-400",
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Activity & Audit Logs</h1>
        <p className="text-gray-400 mt-1">Complete audit trail of all system actions — {logs.length} entries</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Events", value: logs.length, color: "text-white" },
          { label: "Login Events", value: logs.filter(l => l.action.startsWith("LOGIN")).length, color: "text-orange-400" },
          { label: "Data Changes", value: logs.filter(l => ["CREATE", "UPDATE", "DELETE"].includes(l.action)).length, color: "text-yellow-400" },
          { label: "Failed Logins", value: logs.filter(l => l.action === "LOGIN_FAILED").length, color: "text-red-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Action</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Resource</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">User</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Details</th>
                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No activity logs yet</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition">
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${actionColors[log.action] || "bg-gray-700 text-gray-400"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-gray-300 text-sm capitalize">{log.resource}</span>
                      {log.resourceId && <span className="text-gray-600 text-xs ml-1">#{log.resourceId}</span>}
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-gray-300 text-sm">{log.username || "—"}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-gray-500 text-xs">{log.details || "—"}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-gray-500 text-xs">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
