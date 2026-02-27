"use client";

export default function ExportButtons() {
  function exportCSV(type: string) {
    window.open(`/api/admin/export?type=${type}`, "_blank");
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 text-sm">Export:</span>
      <button
        onClick={() => exportCSV("products")}
        className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white text-sm px-4 py-2 rounded-lg transition flex items-center gap-2"
      >
        📊 Products CSV
      </button>
      <button
        onClick={() => exportCSV("users")}
        className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white text-sm px-4 py-2 rounded-lg transition flex items-center gap-2"
      >
        👥 Users CSV
      </button>
      <button
        onClick={() => exportCSV("logs")}
        className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white text-sm px-4 py-2 rounded-lg transition flex items-center gap-2"
      >
        📋 Logs CSV
      </button>
    </div>
  );
}
