import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { chatSessions, chatMessages, aiSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerEmail, customerPhone } = body;

    // Generate a unique session ID
    const sessionId = `RC-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Get AI settings for welcome message
    let welcomeSetting: { value: string } | undefined;
    try {
      const settings = await db.select().from(aiSettings);
      welcomeSetting = settings.find((s) => s.key === "welcome_message");
    } catch (error) {
      console.error("Error fetching AI settings:", error);
    }
    
    const defaultWelcome =
      welcomeSetting?.value ||
      "Hello! Welcome to RIGHTCLICK COMPUTER DIGITALS. I'm here to help you with any questions. How can I assist you today?";

    // Create new chat session
    try {
      await db.insert(chatSessions).values({
        sessionId,
        customerName: customerName || null,
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        status: "active",
        isAiMode: true,
      });
    } catch (dbError) {
      console.error("Error creating chat session:", dbError);
    }

    return NextResponse.json({
      success: true,
      sessionId,
      welcomeMessage: defaultWelcome,
    });
  } catch (error) {
    console.error("Error creating chat session:", error);
    // Return a working session even on error so the widget doesn't break
    const sessionId = `RC-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    return NextResponse.json({
      success: true,
      sessionId,
      welcomeMessage: "Hello! Welcome to RIGHTCLICK COMPUTER DIGITALS. How can I help you today?",
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    
    // If sessionId is provided, return messages for that session
    if (sessionId) {
      const messages = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId));
      
      return NextResponse.json({
        success: true,
        messages,
      });
    }
    
    // Otherwise, get active sessions count
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
