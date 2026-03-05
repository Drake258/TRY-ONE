import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { abandonedCarts, coupons } from "@/db/schema";
import { eq, and, gt, sql, desc } from "drizzle-orm";

// POST - Save abandoned cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, items, totalAmount, customerEmail, customerPhone, customerName } = body;

    if (!sessionId || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid cart data" },
        { status: 400 }
      );
    }

    // Check if there's already an abandoned cart for this session
    const existingCart = await db
      .select()
      .from(abandonedCarts)
      .where(eq(abandonedCarts.sessionId, sessionId))
      .limit(1);

    if (existingCart.length > 0) {
      // Update existing cart
      await db
        .update(abandonedCarts)
        .set({
          items: JSON.stringify(items),
          totalAmount,
          customerEmail: customerEmail || existingCart[0].customerEmail,
          customerPhone: customerPhone || existingCart[0].customerPhone,
          customerName: customerName || existingCart[0].customerName,
          updatedAt: new Date(),
        })
        .where(eq(abandonedCarts.id, existingCart[0].id));

      return NextResponse.json({
        success: true,
        message: "Cart updated",
        cartId: existingCart[0].id,
      });
    }

    // Generate discount code for recovery
    const discountCode = `COMEBACK${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Create new abandoned cart
    const [newCart] = await db
      .insert(abandonedCarts)
      .values({
        sessionId,
        items: JSON.stringify(items),
        totalAmount,
        customerEmail,
        customerPhone,
        customerName,
        discountCode,
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Cart saved",
      cartId: newCart.id,
      discountCode,
    });
  } catch (error) {
    console.error("Error saving abandoned cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save cart" },
      { status: 500 }
    );
  }
}

// GET - Get abandoned cart for recovery
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId");
    const email = searchParams.get("email");

    if (!sessionId && !email) {
      return NextResponse.json(
        { success: false, error: "Session ID or email required" },
        { status: 400 }
      );
    }

    let cart;
    if (sessionId) {
      cart = await db
        .select()
        .from(abandonedCarts)
        .where(eq(abandonedCarts.sessionId, sessionId))
        .orderBy(desc(abandonedCarts.createdAt))
        .limit(1);
    } else if (email) {
      cart = await db
        .select()
        .from(abandonedCarts)
        .where(eq(abandonedCarts.customerEmail, email))
        .orderBy(desc(abandonedCarts.createdAt))
        .limit(1);
    }

    if (!cart || cart.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "No abandoned cart found",
      });
    }

    const abandonedCart = cart[0];
    const items = JSON.parse(abandonedCart.items || "[]");

    return NextResponse.json({
      success: true,
      data: {
        ...abandonedCart,
        items,
        discountCode: abandonedCart.discountCode,
      },
    });
  } catch (error) {
    console.error("Error getting abandoned cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get cart" },
      { status: 500 }
    );
  }
}

// PATCH - Mark cart as recovered or send recovery email
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, cartId, email } = body;

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: "Cart ID required" },
        { status: 400 }
      );
    }

    if (action === "mark_recovered") {
      await db
        .update(abandonedCarts)
        .set({
          recoveredAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(abandonedCarts.id, cartId));

      return NextResponse.json({
        success: true,
        message: "Cart marked as recovered",
      });
    }

    if (action === "send_recovery_email") {
      const cart = await db
        .select()
        .from(abandonedCarts)
        .where(eq(abandonedCarts.id, cartId))
        .limit(1);

      if (cart.length === 0) {
        return NextResponse.json(
          { success: false, error: "Cart not found" },
          { status: 404 }
        );
      }

      // In production, this would send an actual email
      // For now, we'll simulate the email sending
      await db
        .update(abandonedCarts)
        .set({
          recoveryEmailSent: true,
          recoveryEmailSentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(abandonedCarts.id, cartId));

      return NextResponse.json({
        success: true,
        message: "Recovery email simulated",
        discountCode: cart[0].discountCode,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating abandoned cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update cart" },
      { status: 500 }
    );
  }
}
