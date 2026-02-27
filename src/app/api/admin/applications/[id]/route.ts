import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { eq } from "drizzle-orm";

// PATCH - Update application status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    if (!status || !["pending", "reviewed", "accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const result = await db
      .update(applications)
      .set({
        status,
        notes: notes || null,
        updatedAt: new Date(),
      })
      .where(eq(applications.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}

// GET - Fetch single application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .select()
      .from(applications)
      .where(eq(applications.id, parseInt(id)));

    if (result.length === 0) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 });
  }
}
