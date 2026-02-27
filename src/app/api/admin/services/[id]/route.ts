import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession, logActivity } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const serviceId = parseInt(id);
  if (isNaN(serviceId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const body = await request.json();
    const { name, category, description, price, duration, featured, active } = body;

    const [updated] = await db.update(services).set({
      name,
      category,
      description: description || null,
      price: parseFloat(price),
      duration: duration || null,
      featured,
      active,
      updatedAt: new Date(),
    }).where(eq(services.id, serviceId)).returning();

    if (!updated) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    await logActivity(session.user.id, session.user.username, "UPDATE", "service", String(serviceId), `Updated service: ${name}`);

    return NextResponse.json({ success: true, service: updated });
  } catch (error) {
    console.error("Update service error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const serviceId = parseInt(id);
  if (isNaN(serviceId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const existing = await db.select().from(services).where(eq(services.id, serviceId));
    if (existing.length === 0) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    await db.delete(services).where(eq(services.id, serviceId));
    await logActivity(session.user.id, session.user.username, "DELETE", "service", String(serviceId), `Deleted service: ${existing[0].name}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete service error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
