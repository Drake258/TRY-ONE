import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiResponses, aiSettings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET - Get all AI responses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const activeOnly = searchParams.get("activeOnly") === "true";

    let query = db.select().from(aiResponses).orderBy(desc(aiResponses.priority));

    if (activeOnly) {
      query = query.where(eq(aiResponses.isActive, true)) as any;
    }

    const responses = await query;

    let filteredResponses = responses;
    if (category) {
      filteredResponses = responses.filter((r) => r.category === category);
    }

    return NextResponse.json({
      success: true,
      responses: filteredResponses,
    });
  } catch (error) {
    console.error("Error getting AI responses:", error);
    return NextResponse.json(
      { error: "Failed to get responses" },
      { status: 500 }
    );
  }
}

// POST - Create new AI response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trigger, category, response, keywords, isActive, priority } = body;

    if (!trigger || !category || !response) {
      return NextResponse.json(
        { error: "Trigger, category, and response are required" },
        { status: 400 }
      );
    }

    const newResponse = await db.insert(aiResponses).values({
      trigger,
      category,
      response,
      keywords: keywords || "",
      isActive: isActive !== false,
      priority: priority || 0,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error creating AI response:", error);
    return NextResponse.json(
      { error: "Failed to create response" },
      { status: 500 }
    );
  }
}

// PUT - Update AI response
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, trigger, category, response, keywords, isActive, priority } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Response ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = { updatedAt: new Date() };
    if (trigger !== undefined) updateData.trigger = trigger;
    if (category !== undefined) updateData.category = category;
    if (response !== undefined) updateData.response = response;
    if (keywords !== undefined) updateData.keywords = keywords;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (priority !== undefined) updateData.priority = priority;

    await db
      .update(aiResponses)
      .set(updateData)
      .where(eq(aiResponses.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating AI response:", error);
    return NextResponse.json(
      { error: "Failed to update response" },
      { status: 500 }
    );
  }
}

// DELETE - Delete AI response
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Response ID is required" },
        { status: 400 }
      );
    }

    await db
      .delete(aiResponses)
      .where(eq(aiResponses.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting AI response:", error);
    return NextResponse.json(
      { error: "Failed to delete response" },
      { status: 500 }
    );
  }
}
