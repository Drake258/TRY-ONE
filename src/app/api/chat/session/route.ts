import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { chatSessions, aiSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerEmail, customerPhone } = body;

    // Generate a unique session ID
    const sessionId = `RC-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Get AI settings for welcome message
    const settings = await db.select().from(aiSettings);
    const welcomeSetting = settings.find((s) => s.key === "welcome_message");
    const defaultWelcome =
      welcomeSetting?.value ||
      "Hello! Welcome to RIGHTCLICK COMPUTER DIGITALS. I'm here to help you with any questions. How can I assist you today?";

    // Create new chat session
    await db.insert(chatSessions).values({
      sessionId,
      customerName: customerName || null,
      customerEmail: customerEmail || null,
      customerPhone: customerPhone || null,
      status: "active",
      isAiMode: true,
    });

    return NextResponse.json({
      success: true,
      sessionId,
      welcomeMessage: defaultWelcome,
    });
  } catch (error) {
    console.error("Error creating chat session:", error);
    return NextResponse.json(
      { error: "Failed to create chat session" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get active sessions count
    const sessions = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.status, "active"));

    return NextResponse.json({
      success: true,
      activeSessions: sessions.length,
    });
  } catch (error) {
    console.error("Error getting chat sessions:", error);
    return NextResponse.json(
      { error: "Failed to get chat sessions" },
      { status: 500 }
    );
  }
}
