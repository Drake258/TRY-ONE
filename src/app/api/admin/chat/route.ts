import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { chatSessions, chatMessages, aiResponses, aiSettings } from "@/db/schema";
import { eq, or, and, desc, asc, sql } from "drizzle-orm";

// GET - Get all chat sessions (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = db.select().from(chatSessions);

    if (status) {
      query = db.select().from(chatSessions).where(sql`${chatSessions.status} = ${status}`) as any;
    }

    const sessions = await query
      .orderBy(desc(chatSessions.updatedAt))
      .limit(limit)
      .offset(offset);

    // Get message count for each session
    const sessionsWithCounts = await Promise.all(
      sessions.map(async (session) => {
        const messages = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.sessionId, session.sessionId));
        
        return {
          ...session,
          messageCount: messages.length,
          lastMessage: messages[messages.length - 1]?.message || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      sessions: sessionsWithCounts,
    });
  } catch (error) {
    console.error("Error getting chat sessions:", error);
    return NextResponse.json(
      { error: "Failed to get chat sessions" },
      { status: 500 }
    );
  }
}

// PATCH - Update chat session (e.g., change status, assign to staff)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, status, assignedTo, isAiMode } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    const updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (isAiMode !== undefined) updateData.isAiMode = isAiMode;

    await db
      .update(chatSessions)
      .set(updateData)
      .where(eq(chatSessions.sessionId, sessionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating chat session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}
