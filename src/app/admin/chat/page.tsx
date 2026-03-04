"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ChatSession {
  id: number;
  sessionId: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  orderNumber: string | null;
  status: string;
  isAiMode: boolean;
  assignedTo: number | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage: string | null;
}

interface AIResponse {
  id: number;
  trigger: string;
  category: string;
  response: string;
  keywords: string;
  isActive: boolean;
  priority: number;
}

export default function ChatManagementPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [sessionMessages, setSessionMessages] = useState<any[]>([]);
  const [adminMessage, setAdminMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"sessions" | "responses" | "settings">("sessions");
  const [loading, setLoading] = useState(true);
  const [aiSettings, setAiSettings] = useState<Record<string, string>>({
    ai_enabled: "true",
    welcome_message: "",
    company_phone: "",
    company_email: "",
    business_hours: "",
  });

  useEffect(() => {
    fetchSessions();
    fetchResponses();
    fetchSettings();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/admin/chat?status=active");
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async () => {
    try {
      const res = await fetch("/api/admin/ai-responses");
      const data = await res.json();
      if (data.success) {
        setResponses(data.responses);
      }
    } catch (error) {
      console.error("Error fetching responses:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/ai-settings");
      const data = await res.json();
      if (data.success) {
        setAiSettings(data.settings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchSessionMessages = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/admin/chat/${sessionId}`);
      const data = await res.json();
      if (data.success) {
        setSessionMessages(data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSessionClick = (session: ChatSession) => {
    setSelectedSession(session);
    fetchSessionMessages(session.sessionId);
  };

  const sendAdminMessage = async () => {
    if (!selectedSession || !adminMessage.trim()) return;

    try {
      const res = await fetch(`/api/admin/chat/${selectedSession.sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: adminMessage }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminMessage("");
        fetchSessionMessages(selectedSession.sessionId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const toggleResponseStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/ai-responses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchResponses();
      }
    } catch (error) {
      console.error("Error toggling response:", error);
    }
  };

  const updateAiSetting = async (key: string, value: string) => {
    try {
      const res = await fetch("/api/admin/ai-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const data = await res.json();
      if (data.success) {
        setAiSettings((prev) => ({ ...prev, [key]: value }));
      }
    } catch (error) {
      console.error("Error updating setting:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Assistant Management</h1>
          <p className="text-gray-600">Monitor chats and manage AI responses</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("sessions")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "sessions"
              ? "border-b-2 border-violet-500 text-violet-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Chat Sessions ({sessions.length})
        </button>
        <button
          onClick={() => setActiveTab("responses")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "responses"
              ? "border-b-2 border-violet-500 text-violet-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          AI Responses ({responses.length})
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "settings"
              ? "border-b-2 border-violet-500 text-violet-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Settings
        </button>
      </div>

      {/* Sessions Tab */}
      {activeTab === "sessions" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sessions List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold">Active Conversations</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {sessions.length === 0 ? (
                <p className="p-4 text-gray-500 text-center">No active sessions</p>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.sessionId}
                    onClick={() => handleSessionClick(session)}
                    className={`w-full p-4 text-left border-b hover:bg-violet-50 transition-colors ${
                      selectedSession?.sessionId === session.sessionId
                        ? "bg-violet-50"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {session.customerName || "Anonymous"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {session.customerEmail || session.customerPhone || "No contact info"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          session.status === "escalated"
                            ? "bg-red-100 text-red-700"
                            : session.status === "closed"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 truncate">
                      {session.lastMessage || "No messages yet"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(session.updatedAt)} • {session.messageCount} messages
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Detail */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {selectedSession ? (
              <>
                <div className="p-4 border-b bg-gray-50">
                  <h2 className="font-semibold">
                    Chat with {selectedSession.customerName || "Anonymous"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Session: {selectedSession.sessionId} • Mode:{" "}
                    {selectedSession.isAiMode ? "AI" : "Human"}
                  </p>
                </div>
                <div className="h-80 overflow-y-auto p-4 space-y-4">
                  {sessionMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === "admin" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.sender === "admin"
                            ? "bg-blue-500 text-white"
                            : msg.sender === "ai"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-violet-100 text-gray-800"
                        }`}
                      >
                        <p className="text-xs font-semibold mb-1 opacity-75">
                          {msg.senderName || msg.sender}
                        </p>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {formatDate(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendAdminMessage()}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-violet-500"
                    />
                    <button
                      onClick={sendAdminMessage}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-96 flex items-center justify-center text-gray-500">
                Select a conversation to view messages
              </div>
            )}
          </div>
        </div>
      )}

      {/* Responses Tab */}
      {activeTab === "responses" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="font-semibold">AI Response Templates</h2>
            <div className="flex gap-2">
              <select
                onChange={(e) => {
                  const filtered = responses.filter(
                    (r) => e.target.value === "all" || r.category === e.target.value
                  );
                  if (e.target.value === "all") {
                    fetchResponses();
                  } else {
                    setResponses(responses.filter(
                      (r) => e.target.value === "all" || r.category === e.target.value
                    ));
                  }
                }}
                className="px-3 py-1.5 border rounded-lg text-sm"
              >
                <option value="all">All Categories</option>
                <option value="greeting">Greeting</option>
                <option value="faq">FAQ</option>
                <option value="pricing">Pricing</option>
                <option value="shipping">Shipping</option>
                <option value="returns">Returns</option>
                <option value="payment">Payment</option>
                <option value="product">Product</option>
                <option value="order">Order</option>
                <option value="support">Support</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trigger
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Response Preview
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {responses.map((resp) => (
                  <tr key={resp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{resp.trigger}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                        {resp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {resp.response}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{resp.priority}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleResponseStatus(resp.id, resp.isActive)}
                        className={`px-2 py-1 text-xs rounded-full ${
                          resp.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {resp.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-violet-600 hover:text-violet-700 text-sm font-medium">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-4">AI Mode Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable AI Assistant</p>
                  <p className="text-sm text-gray-500">
                    Allow customers to use the AI chat widget
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateAiSetting(
                      "ai_enabled",
                      aiSettings.ai_enabled === "true" ? "false" : "true"
                    )
                  }
                  className={`w-12 h-6 rounded-full transition-colors ${
                    aiSettings.ai_enabled === "true"
                      ? "bg-violet-500"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      aiSettings.ai_enabled === "true"
                        ? "translate-x-6"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-4">Welcome Message</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial greeting message
                </label>
                <textarea
                  value={aiSettings.welcome_message || ""}
                  onChange={(e) => setAiSettings((prev) => ({ ...prev, welcome_message: e.target.value }))}
                  onBlur={(e) => updateAiSetting("welcome_message", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="Enter welcome message..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={aiSettings.company_phone || ""}
                  onChange={(e) => setAiSettings((prev) => ({ ...prev, company_phone: e.target.value }))}
                  onBlur={(e) => updateAiSetting("company_phone", e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="0503819000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={aiSettings.company_email || ""}
                  onChange={(e) => setAiSettings((prev) => ({ ...prev, company_email: e.target.value }))}
                  onBlur={(e) => updateAiSetting("company_email", e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="info@rightclickdigitals.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Hours
                </label>
                <input
                  type="text"
                  value={aiSettings.business_hours || ""}
                  onChange={(e) => setAiSettings((prev) => ({ ...prev, business_hours: e.target.value }))}
                  onBlur={(e) => updateAiSetting("business_hours", e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="Monday - Friday: 8 AM - 6 PM"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
