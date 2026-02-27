import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import CreateAdminUserForm from "@/components/admin/CreateAdminUserForm";

export default async function CreateAdminUserPage() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") redirect("/admin");

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
          <Link href="/admin/users" className="hover:text-white transition">Users</Link>
          <span>/</span>
          <span className="text-white">Create User</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Create New User</h1>
        <p className="text-gray-400 mt-1">Create a new staff or admin user with appropriate access levels.</p>
      </div>

      <div className="max-w-lg">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-yellow-400 text-lg flex-shrink-0">⚠️</span>
          <div>
            <div className="text-yellow-400 font-medium text-sm">Admin Access Warning</div>
            <div className="text-yellow-300/70 text-xs mt-1">
              Admin users have full access to all system features including user management, settings, and data export.
              Only create admin accounts for trusted staff members.
            </div>
          </div>
        </div>

        <CreateAdminUserForm createdBy={session.user.id} />
      </div>
    </div>
  );
}
