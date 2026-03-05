import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { chatSessions, chatMessages, aiResponses, aiSettings, products, orders } from "@/db/schema";
import { eq, or, and, ilike, desc, sql } from "drizzle-orm";

// Simple NLP-like response matching
function findBestResponse(
  userMessage: string,
  responses: any[]
): { response: string; type: string; metadata?: any } | null {
  // If no responses in database, use fallback
  if (!responses || responses.length === 0) {
    return getFallbackResponse(userMessage);
  }
  
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
        "To check your order status, please provide your order number (format: RC-XXXXX) or your phone number.",
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

// Fallback responses when database is empty
function getFallbackResponse(userMessage: string): { response: string; type: string; metadata?: any } {
  const messageLower = userMessage.toLowerCase();
  
  // Greetings
  if (messageLower.match(/^(hello|hi|hey|good morning|good afternoon|good evening)/)) {
    return {
      response: "Hello! Welcome to RIGHTCLICK COMPUTER DIGITALS. I'm here to help you with any questions about our products, services, orders, or technical support. How can I assist you today?",
      type: "greeting",
    };
  }
  
  // Order status
  if (messageLower.includes("order") || messageLower.includes("track") || messageLower.includes("delivery")) {
    return {
      response: "To check your order status, please provide your order number (format: RC-XXXXX) or your phone number. You can also call us at 0503819000 for immediate assistance.",
      type: "order_query",
    };
  }
  
  // Payment
  if (messageLower.includes("payment") || messageLower.includes("pay") || messageLower.includes("momo")) {
    return {
      response: "We accept Mobile Money (MoMo), Bank Transfer, Card Payments, and Cash. To pay via MoMo, send amount to 0503819000 with your order number as reference.",
      type: "payment",
    };
  }
  
  // Shipping
  if (messageLower.includes("shipping") || messageLower.includes("delivery") || messageLower.includes("deliver")) {
    return {
      response: "We offer same-day delivery within Accra and 2-5 business days for other regions. You can also pick up from our store. Delivery fees vary by location.",
      type: "shipping",
    };
  }
  
  // Contact
  if (messageLower.includes("contact") || messageLower.includes("phone") || messageLower.includes("call")) {
    return {
      response: "You can reach us at 0503819000 (call/WhatsApp), email info@rightclickdigitals.com, or visit our store in Accra, Ghana. We're open Monday-Friday 8AM-6PM.",
      type: "general",
    };
  }
  
  // Price/Pricing
  if (messageLower.includes("price") || messageLower.includes("cost") || messageLower.includes("how much")) {
    return {
      response: "We have laptops for all budgets: Budget (₵5,000-₵8,000), Mid-range (₵8,000-₵15,000), High-performance (₵15,000-₵25,000), Gaming (₵18,000-₵35,000). Would you like specific recommendations?",
      type: "pricing",
    };
  }
  
  // Default fallback
  return {
    response: "Thank you for contacting RIGHTCLICK COMPUTER DIGITALS! I'm here to help with product information, order tracking, payments, and technical support. Could you please provide more details about your question? You can also call us at 0503819000 for immediate assistance.",
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
    let aiResponsesData: any[] = [];
    try {
      aiResponsesData = await db
        .select()
        .from(aiResponses)
        .where(sql`${aiResponses.isActive} = 1`)
        .orderBy(desc(aiResponses.priority));
    } catch (error) {
      console.error("Error fetching AI responses:", error);
    }

    // Find best response
    const aiResult = findBestResponse(message, aiResponsesData);

    let responseText = "";
    let messageType = "text";
    let metadata = aiResult?.metadata;
    let escalated = false;

    // If we found an order match in the message, look up the order
    const orderMatch = message.match(/RC-[A-Z0-9-]+/i) || message.match(/TRK-[A-Z0-9-]+/i);
    if (orderMatch) {
      try {
        const orderNumber = orderMatch[0].toUpperCase();
        const orderResults = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
        
        if (orderResults.length > 0) {
          const order = orderResults[0];
          const items = JSON.parse(order.items as string);
          const itemList = items.map((item: any) => `• ${item.name} x${item.quantity} - ₵${item.price * item.quantity}`).join("\n");
          
          responseText = `**Order Details for ${order.orderNumber}**\n\n` +
            `**Status:** ${order.status}\n` +
            `**Tracking Number:** ${order.trackingNumber}\n` +
            `**Payment Status:** ${order.paymentStatus}\n\n` +
            `**Items:**\n${itemList}\n\n` +
            `**Total:** ₵${order.totalAmount}\n\n` +
            `Contact us at 0503819000 for any questions about your order.`;
          messageType = "order_query";
        } else {
          responseText = `I couldn't find an order with number "${orderNumber}". Please check your order number and try again.`;
          messageType = "order_query";
        }
      } catch (orderError) {
        console.error("Error looking up order:", orderError);
        responseText = aiResult?.response || "I'm here to help! Please call us at 0503819000 for immediate assistance.";
        messageType = aiResult?.type || "text";
      }
    } else {
      // Use AI response as default
      responseText = aiResult?.response || "I'm here to help! Please call us at 0503819000 for immediate assistance.";
      messageType = aiResult?.type || "text";
    }

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
