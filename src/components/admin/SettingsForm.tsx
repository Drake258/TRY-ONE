"use client";

import { useState } from "react";

type Settings = Record<string, string>;

export default function SettingsForm({ settings }: { settings: Settings }) {
  const [form, setForm] = useState({
    site_name: settings.site_name || "RIGHTCLICK COMPUTER DIGITALS",
    site_slogan: settings.site_slogan || "We give you options.",
    contact_email: settings.contact_email || "",
    contact_phone: settings.contact_phone || "",
    contact_address: settings.contact_address || "",
    max_login_attempts: settings.max_login_attempts || "5",
    session_timeout_hours: settings.session_timeout_hours || "24",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage("Settings saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save settings");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition placeholder-gray-600 text-sm";
  const labelClass = "block text-gray-300 text-sm font-medium mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg px-4 py-3 text-sm">
          ✅ {message}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Site Settings */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
          <span>🌐</span> Site Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Company Name</label>
            <input type="text" value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Company Slogan</label>
            <input type="text" value={form.site_slogan} onChange={(e) => setForm({ ...form, site_slogan: e.target.value })} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Contact Settings */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
          <span>📞</span> Contact Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Email Address</label>
            <input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className={inputClass} placeholder="info@example.com" />
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input type="text" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className={inputClass} placeholder="+1 (555) 000-0000" />
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <input type="text" value={form.contact_address} onChange={(e) => setForm({ ...form, contact_address: e.target.value })} className={inputClass} placeholder="123 Main St, City" />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
          <span>🔒</span> Security Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Max Login Attempts</label>
            <input type="number" min="1" max="20" value={form.max_login_attempts} onChange={(e) => setForm({ ...form, max_login_attempts: e.target.value })} className={inputClass} />
            <p className="text-gray-500 text-xs mt-1">Number of failed attempts before account lockout</p>
          </div>
          <div>
            <label className={labelClass}>Session Timeout (hours)</label>
            <input type="number" min="1" max="168" value={form.session_timeout_hours} onChange={(e) => setForm({ ...form, session_timeout_hours: e.target.value })} className={inputClass} />
            <p className="text-gray-500 text-xs mt-1">How long before users are automatically logged out</p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white font-semibold px-8 py-3 rounded-xl transition flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Saving...
          </>
        ) : (
          "Save Settings"
        )}
      </button>
    </form>
  );
}
