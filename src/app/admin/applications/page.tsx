"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Application = {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  cvPath: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
};

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      const url = filter === "all" 
        ? "/api/admin/applications" 
        : `/api/admin/applications?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setApplications(data.data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchApplications();
        setSelectedApp(null);
      }
    } catch (error) {
      console.error("Error updating application:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    reviewed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    accepted: "bg-green-500/10 text-green-400 border-green-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-400 hover:text-white transition">
                ← Back
              </Link>
              <h1 className="text-xl font-bold">Job Applications</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">
                {applications.length} application{applications.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {["all", "pending", "reviewed", "accepted", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400">Loading applications...</div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-400 text-lg">No applications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition cursor-pointer"
                onClick={() => setSelectedApp(app)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{app.fullName}</h3>
                    <p className="text-gray-400 text-sm">{app.email}</p>
                    <p className="text-gray-500 text-sm">{app.phoneNumber}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full border capitalize ${statusColors[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                </div>
                <div className="mt-3 text-gray-500 text-sm">
                  Applied on {formatDate(app.createdAt)}
                  {app.cvPath && (
                    <span className="ml-3 text-blue-400">📎 CV attached</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Application Details</h2>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm">Full Name</label>
                  <p className="text-white font-medium">{selectedApp.fullName}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Email</label>
                  <p className="text-white">{selectedApp.email}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Phone Number</label>
                  <p className="text-white">{selectedApp.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Status</label>
                  <div className="mt-1">
                    <span className={`text-xs px-3 py-1 rounded-full border capitalize ${statusColors[selectedApp.status]}`}>
                      {selectedApp.status}
                    </span>
                  </div>
                </div>
                {selectedApp.cvPath && (
                  <div>
                    <label className="text-gray-400 text-sm">CV</label>
                    <a
                      href={selectedApp.cvPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mt-1"
                    >
                      📎 View CV
                    </a>
                  </div>
                )}
                <div>
                  <label className="text-gray-400 text-sm">Applied On</label>
                  <p className="text-white">{formatDate(selectedApp.createdAt)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <label className="text-gray-400 text-sm mb-3 block">Update Status</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateStatus(selectedApp.id, "pending")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      selectedApp.status === "pending"
                        ? "bg-yellow-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => updateStatus(selectedApp.id, "reviewed")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      selectedApp.status === "reviewed"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Reviewed
                  </button>
                  <button
                    onClick={() => updateStatus(selectedApp.id, "accepted")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      selectedApp.status === "accepted"
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => updateStatus(selectedApp.id, "rejected")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      selectedApp.status === "rejected"
                        ? "bg-red-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
