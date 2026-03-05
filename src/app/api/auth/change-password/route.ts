import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession, hashPassword, logActivity } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "New passwords do not match" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const user = session.user;

    // Verify current password
    const { verifyPassword } = await import("@/lib/auth");
    const valid = await verifyPassword(currentPassword, user.passwordHash);
    
    if (!valid) {
      await logActivity(user.id, user.username, "PASSWORD_CHANGE_FAILED", "auth", String(user.id), "Invalid current password");
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    // Hash new password and update
    const newPasswordHash = await hashPassword(newPassword);
    
    await db
      .update(users)
      .set({ 
        passwordHash: newPasswordHash,
        mustChangePassword: false,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    await logActivity(user.id, user.username, "PASSWORD_CHANGED", "auth", String(user.id), "Password changed successfully");

    return NextResponse.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
