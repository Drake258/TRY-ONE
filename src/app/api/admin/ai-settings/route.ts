import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { aiSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET - Get AI settings
export async function GET() {
  try {
    const settings = await db.select().from(aiSettings);
    
    // Convert to key-value object
    const settingsObj: Record<string, string> = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    return NextResponse.json({
      success: true,
      settings: settingsObj,
    });
  } catch (error) {
    console.error("Error getting AI settings:", error);
    return NextResponse.json(
      { error: "Failed to get settings" },
      { status: 500 }
    );
  }
}

// POST - Update AI settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Key and value are required" },
        { status: 400 }
      );
    }

    // Check if setting exists
    const existing = await db
      .select()
      .from(aiSettings)
      .where(eq(aiSettings.key, key));

    if (existing.length > 0) {
      // Update
      await db
        .update(aiSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(aiSettings.key, key));
    } else {
      // Create
      await db.insert(aiSettings).values({
        key,
        value,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating AI settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
