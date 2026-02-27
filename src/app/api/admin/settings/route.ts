import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession, logActivity } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
  }

  try {
    const body = await request.json();

    for (const [key, value] of Object.entries(body)) {
      const existing = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
      if (existing.length > 0) {
        await db.update(systemSettings).set({ value: String(value), updatedAt: new Date(), updatedBy: session.user.id }).where(eq(systemSettings.key, key));
      } else {
        await db.insert(systemSettings).values({ key, value: String(value), updatedBy: session.user.id });
      }
    }

    await logActivity(session.user.id, session.user.username, "UPDATE", "settings", undefined, "Updated system settings");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
