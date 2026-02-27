"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UserActions({
  userId,
  currentStatus,
  currentRole,
  currentUserId,
}: {
  userId: number;
  currentStatus: string;
  currentRole: string;
  currentUserId: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isSelf = userId === currentUserId;

  async function handleToggleStatus() {
    if (isSelf) return alert("You cannot suspend your own account.");
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    const action = newStatus === "suspended" ? "suspend" : "reactivate";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) router.refresh();
      else alert("Failed to update user status");
    } catch {
      alert("Error updating user");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleRole() {
    if (isSelf) return alert("You cannot change your own role.");
    const newRole = currentRole === "admin" ? "staff" : "admin";
    if (!confirm(`Change this user's role to ${newRole}?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) router.refresh();
      else alert("Failed to update user role");
    } catch {
      alert("Error updating user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <button
        onClick={handleToggleRole}
        disabled={loading || isSelf}
        className="text-yellow-400 hover:text-yellow-300 text-xs px-2.5 py-1.5 rounded-lg hover:bg-yellow-500/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
        title={isSelf ? "Cannot change own role" : `Change to ${currentRole === "admin" ? "staff" : "admin"}`}
      >
        {currentRole === "admin" ? "→ Staff" : "→ Admin"}
      </button>
      <button
        onClick={handleToggleStatus}
        disabled={loading || isSelf}
        className={`text-xs px-2.5 py-1.5 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed ${
          currentStatus === "active"
            ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
            : "text-green-400 hover:text-green-300 hover:bg-green-500/10"
        }`}
        title={isSelf ? "Cannot suspend own account" : undefined}
      >
        {loading ? "..." : currentStatus === "active" ? "Suspend" : "Activate"}
      </button>
    </div>
  );
}
