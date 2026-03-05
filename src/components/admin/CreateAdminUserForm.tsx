"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateAdminUserForm({ createdBy }: { createdBy: number }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("admin");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role, createdBy }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create user");
      } else {
        setSuccess(`${role === "admin" ? "Admin" : "Staff"} user "${username}" created successfully!`);
        setTimeout(() => {
          router.push("/admin/users");
          router.refresh();
        }, 1500);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition placeholder-gray-600 text-sm";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
        <span>👤</span> New User Account
      </h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-5 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg px-4 py-3 mb-5 text-sm flex items-center gap-2">
          <span>✅</span> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1.5">Username *</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            className={inputClass}
            placeholder="Enter username"
            autoComplete="off"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1.5">Password *</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={inputClass + " pr-12"}
              placeholder="Enter password (min. 6 characters)"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1.5">Confirm Password *</label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={inputClass}
            placeholder="Confirm password"
            autoComplete="new-password"
          />
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-3">
          <span className="text-yellow-400 text-lg">{role === "admin" ? "🛡️" : "👤"}</span>
          <div className="flex-1">
            <label className="block text-gray-300 text-sm font-medium mb-1.5">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "staff")}
              className={inputClass}
            >
              <option value="admin">Admin - Full access</option>
              <option value="staff">Staff - Limited access</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white font-semibold px-6 py-3 rounded-xl transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating...
              </>
            ) : (
              `Create ${role === "admin" ? "Admin" : "Staff"} User`
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/users")}
            className="text-gray-400 hover:text-white px-4 py-3 rounded-xl hover:bg-gray-800 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
