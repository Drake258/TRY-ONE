import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { chatSessions, chatMessages, aiResponses, aiSettings, products } from "@/db/schema";
import { eq, or, and, ilike, desc, sql } from "drizzle-orm";

// Simple NLP-like response matching
function findBestResponse(
  userMessage: string,
  responses: any[]
): { response: string; type: string; metadata?: any } | null {
  const messageLower = userMessage.toLowerCase();
  
  // Sort by priority (higher first)
  const sortedResponses = [...responses].sort((a, b) => b.priority - a.priority);

  // Check for keyword matches
  for (const r of sortedResponses) {
    if (!r.isActive) continue;
    
    const triggerLower = (r.trigger || "").toLowerCase();
    const keywords = (r.keywords || "").split(",").map((k: string) => k.trim().toLowerCase());
    
    // Check trigger or keywords
    if (triggerLower === "default") continue;
    
    if (
      messageLower.includes(triggerLower) ||
      keywords.some((k: string) => k && messageLower.includes(k))
    ) {
      return {
        response: r.response,
        type: r.category,
      };
    }
  }

  // Check for escalation keywords
  const escalationKeywords = ["speak to human", "real person", "manager", "supervisor", "agent", "talk to someone"];
  if (escalationKeywords.some(k => messageLower.includes(k))) {
    return {
      response: responses.find(r => r.trigger === "speak to human")?.response || 
        "I'll connect you with a human agent. Please provide your name and order number.",
      type: "escalation",
      metadata: { requiresEscalation: true },
    };
  }

  // Check for complaint keywords
  const complaintKeywords = ["complaint", "unhappy", "disappointed", "terrible", "worst", "awful"];
  if (complaintKeywords.some(k => messageLower.includes(k))) {
    return {
      response: responses.find(r => r.trigger === "complaint")?.response ||
        "I'm sorry to hear about your experience. Let me escalate this to our management team immediately.",
      type: "support",
      metadata: { requiresEscalation: true },
    };
  }

  // Check for order-related queries
  const orderKeywords = ["order", "track", "delivery", "shipping", "arrived", "arriving"];
  if (orderKeywords.some(k => messageLower.includes(k))) {
    return {
      response: responses.find(r => r.trigger === "order status")?.response ||
        "To check your order status, please provide your order number (format: RC-XXXXX).",
      type: "order_query",
    };
  }

  // Default response
  const defaultResponse = responses.find(r => r.trigger === "default");
  return {
    response: defaultResponse?.response ||
      "Thank you for contacting us! Could you please provide more details about your question?",
    type: "general",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message, productId, cartItems } = body;

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the chat session
    const sessions = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.sessionId, sessionId));

    if (sessions.length === 0) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 404 }
      );
    }

    const session = sessions[0];

    // Save user message
    await db.insert(chatMessages).values({
      sessionId,
      message,
      sender: "customer",
      messageType: "text",
    });

    // Get AI responses from database
    const aiResponsesData = await db
      .select()
      .from(aiResponses)
      .where(sql`${aiResponses.isActive} = 1`)
      .orderBy(desc(aiResponses.priority));

    // Find best response
    const aiResult = findBestResponse(message, aiResponsesData);

    let responseText = aiResult?.response || "I'm here to help! Please call us at 0503819000 for immediate assistance.";
    let messageType = aiResult?.type || "text";
    let metadata = aiResult?.metadata;
    let escalated = false;

    // Check if escalation is needed
    if (aiResult?.metadata?.requiresEscalation) {
      escalated = true;
      // Update session status to escalated
      await db
        .update(chatSessions)
        .set({ status: "escalated" })
        .where(eq(chatSessions.sessionId, sessionId));
    }

    // Check for product recommendations based on cart or search
    if (cartItems && cartItems.length > 0) {
      const cartCategories = cartItems.map((item: any) => item.category || "accessory");
      const relatedProducts = await db
        .select()
        .from(products)
        .where(eq(products.inStock, true))
        .limit(3);
      
      if (relatedProducts.length > 0 && message.toLowerCase().includes("recommend")) {
        const recommendations = relatedProducts.slice(0, 3).map(p => 
          `• ${p.name} - ₵${p.price}`
        ).join("\n");
        
        responseText += `\n\n**You might also like:**\n${recommendations}`;
        messageType = "product_recommendation";
      }
    }

    // Check for specific product query
    if (productId) {
      const productData = await db
        .select()
        .from(products)
        .where(eq(products.id, productId));
      
      if (productData.length > 0) {
        const p = productData[0];
        const productInfo = `\n\n**Current Product:**\n${p.name} - ₵${p.price}\n${p.inStock ? "✅ In Stock" : "❌ Out of Stock"}`;
        
        if (message.toLowerCase().includes("details") || message.toLowerCase().includes("info")) {
          responseText = `**${p.name}**\n\n${p.description || "No description available."}\n\n**Price:** ₵${p.price}\n**Category:** ${p.category}\n${p.processor ? `**Processor:** ${p.processor}` : ""}\n${p.ram ? `**RAM:** ${p.ram}` : ""}\n${p.storage ? `**Storage:** ${p.storage}` : ""}\n${p.graphics ? `**Graphics:** ${p.graphics}` : ""}\n\n${p.inStock ? "✅ This item is available!" : "❌ Currently out of stock"}`;
          messageType = "product";
        } else if (!responseText.includes(productInfo)) {
          responseText += productInfo;
        }
      }
    }

    // Save AI response
    await db.insert(chatMessages).values({
      sessionId,
      message: responseText,
      sender: escalated ? "admin" : "ai",
      senderName: escalated ? "Support Team" : "RIGHTCLICK Assistant",
      messageType: messageType as any,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });

    // Update session timestamp
    await db
      .update(chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessions.sessionId, sessionId));

    return NextResponse.json({
      success: true,
      response: responseText,
      sender: escalated ? "admin" : "ai",
      senderName: escalated ? "Support Team" : "RIGHTCLICK Assistant",
      messageType,
      metadata,
      escalated,
    });
  } catch (error) {
    console.error("Error processing chat message:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
