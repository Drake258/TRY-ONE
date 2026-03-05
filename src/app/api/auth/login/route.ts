import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession, logActivity } from "@/lib/auth";
import { initializeDatabase } from "@/db/init";

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const result = await db.select().from(users).where(eq(users.username, username));

    if (result.length === 0) {
      await logActivity(null, username, "LOGIN_FAILED", "auth", undefined, "User not found");
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const user = result[0];

    if (user.status === "suspended") {
      await logActivity(user.id, username, "LOGIN_BLOCKED", "auth", String(user.id), "Account suspended");
      return NextResponse.json({ error: "Your account has been suspended. Contact an administrator." }, { status: 403 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      await logActivity(user.id, username, "LOGIN_FAILED", "auth", String(user.id), "Invalid password");
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Update last login
    await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id));

    // Check if user must change password
    if (user.mustChangePassword) {
      await logActivity(user.id, username, "LOGIN_SUCCESS_PWD_CHANGE_REQ", "auth", String(user.id), "Login successful - password change required");
      
      // Create session but indicate password change is required
      const sessionId = await createSession(user.id);
      
      const cookieStore = await cookies();
      cookieStore.set("rightclick_session", sessionId, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60,
        path: "/",
      });

      return NextResponse.json({ 
        success: true, 
        role: user.role,
        mustChangePassword: true,
        message: "You must change your password before continuing"
      });
    }

    const sessionId = await createSession(user.id);

    const cookieStore = await cookies();
    cookieStore.set("rightclick_session", sessionId, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
      path: "/",
    });

    await logActivity(user.id, username, "LOGIN_SUCCESS", "auth", String(user.id), "Successful login");

    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
