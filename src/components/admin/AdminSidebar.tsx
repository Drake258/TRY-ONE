"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

type User = {
  id: number;
  username: string;
  role: "admin" | "staff";
  status: "active" | "suspended";
};

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/products", label: "Products", icon: "🖥️" },
  { href: "/admin/services", label: "Services", icon: "🔧" },
  { href: "/admin/applications", label: "Applications", icon: "📝", adminOnly: true },
  { href: "/admin/chat", label: "AI Chat", icon: "💬" },
  { href: "/admin/users/new", label: "Create Staff", icon: "➕", adminOnly: true },
  { href: "/admin/users", label: "Users", icon: "👥", adminOnly: true },
  { href: "/admin/logs", label: "Activity Logs", icon: "📋", adminOnly: true },
  { href: "/admin/reports", label: "Reports", icon: "📈", adminOnly: true },
  { href: "/admin/settings", label: "Settings", icon: "⚙️", adminOnly: true },
];

export default function AdminSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-40">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-icon.svg"
            alt="RightClick Computer Digitals"
            width={36}
            height={36}
            className="w-9 h-9 flex-shrink-0"
          />
          <div>
            <div className="text-white font-bold text-xs leading-tight">RIGHTCLICK</div>
            <div className="text-violet-400 text-xs tracking-widest">COMPUTER DIGITALS</div>
          </div>
        </Link>
        <div className="mt-3 text-xs text-gray-500 font-medium uppercase tracking-wider">Admin Panel</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.adminOnly && user.role !== "admin") return null;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                active
                  ? "bg-violet-600 text-white font-medium"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-violet-800 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{user.username[0].toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-medium truncate">{user.username}</div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${user.role === "admin" ? "bg-yellow-400" : "bg-violet-400"}`} />
              <span className="text-gray-400 text-xs capitalize">{user.role}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
