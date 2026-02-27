import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET - Fetch all applications (admin only)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    if (status && ["pending", "reviewed", "accepted", "rejected"].includes(status)) {
      const result = await db
        .select()
        .from(applications)
        .where(eq(applications.status, status as "pending" | "reviewed" | "accepted" | "rejected"))
        .orderBy(desc(applications.createdAt));
      return NextResponse.json({ success: true, data: result });
    }
    
    const result = await db.select().from(applications).orderBy(desc(applications.createdAt));
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

// POST - Create new application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, phoneNumber, email, cvPath } = body;

    if (!fullName || !phoneNumber || !email) {
      return NextResponse.json(
        { error: "Full name, phone number, and email are required" },
        { status: 400 }
      );
    }

    const result = await db.insert(applications).values({
      fullName,
      phoneNumber,
      email,
      cvPath: cvPath || null,
      status: "pending",
    }).returning();

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
