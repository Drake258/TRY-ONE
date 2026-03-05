"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function ProductActions({ productId }: { productId: number }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete product");
      }
    } catch {
      alert("Error deleting product");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <Link
        href={`/admin/products/${productId}/edit`}
        className="text-orange-400 hover:text-orange-300 text-sm px-3 py-1.5 rounded-lg hover:bg-orange-500/10 transition"
      >
        Edit
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-red-400 hover:text-red-300 text-sm px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition disabled:opacity-50"
      >
        {deleting ? "..." : "Delete"}
      </button>
    </div>
  );
}
