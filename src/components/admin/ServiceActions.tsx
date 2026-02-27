"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  serviceId: number;
};

export default function ServiceActions({ serviceId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this service?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/services/${serviceId}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Error deleting service");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => router.push(`/admin/services/${serviceId}/edit`)}
        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
        title="Edit"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
        title="Delete"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
