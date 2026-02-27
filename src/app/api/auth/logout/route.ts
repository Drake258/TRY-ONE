import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession, deleteSession, logActivity } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getSession();

    if (session) {
      await logActivity(session.user.id, session.user.username, "LOGOUT", "auth", String(session.user.id));
      await deleteSession(session.sessionId);
    }

    const cookieStore = await cookies();
    cookieStore.delete("rightclick_session");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
