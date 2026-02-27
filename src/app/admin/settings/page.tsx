import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsForm from "@/components/admin/SettingsForm";

async function getSettings() {
  const settings = await db.select().from(systemSettings);
  return Object.fromEntries(settings.map((s) => [s.key, s.value]));
}

export default async function SettingsPage() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") redirect("/admin");

  const settings = await getSettings();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">System Settings</h1>
        <p className="text-gray-400 mt-1">Configure system-wide settings and security controls</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <SettingsForm settings={settings} />

        {/* Security Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>🔒</span> Security Information
          </h2>
          <div className="space-y-3">
            {[
              { label: "Password Hashing", value: "SHA-256 with salt", status: "✅ Active" },
              { label: "Session Management", value: "HTTP-only cookies", status: "✅ Active" },
              { label: "Role-Based Access", value: "Admin & Staff roles", status: "✅ Active" },
              { label: "Audit Logging", value: "All actions logged", status: "✅ Active" },
              { label: "Account Suspension", value: "Instant access revocation", status: "✅ Active" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div>
                  <div className="text-white text-sm font-medium">{item.label}</div>
                  <div className="text-gray-500 text-xs">{item.value}</div>
                </div>
                <span className="text-green-400 text-xs">{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>ℹ️</span> System Information
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Application</span>
              <span className="text-white">RIGHTCLICK Marketing Software</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Framework</span>
              <span className="text-white">Next.js 16 + React 19</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Database</span>
              <span className="text-white">SQLite + Drizzle ORM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Styling</span>
              <span className="text-white">Tailwind CSS 4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
