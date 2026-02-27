import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { getSession, logActivity } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, category, description, price, duration, featured, active } = body;

    if (!name || !category || price === undefined) {
      return NextResponse.json({ error: "Name, category, and price are required" }, { status: 400 });
    }

    const [service] = await db.insert(services).values({
      name,
      category,
      description: description || null,
      price: parseFloat(price),
      duration: duration || null,
      featured: featured === true,
      active: active !== false,
      createdBy: session.user.id,
    }).returning();

    await logActivity(session.user.id, session.user.username, "CREATE", "service", String(service.id), `Created service: ${name}`);

    return NextResponse.json({ success: true, service });
  } catch (error) {
    console.error("Create service error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
