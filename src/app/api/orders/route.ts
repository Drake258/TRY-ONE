import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, or, ilike, desc } from "drizzle-orm";

// Generate unique order and tracking numbers
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RC-${timestamp}-${random}`;
}

function generateTrackingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TRK-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, customerEmail, shippingAddress, items, totalAmount, paymentMethod, notes } = body;

    if (!customerName || !customerPhone || !items || !totalAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate order and tracking numbers
    const orderNumber = generateOrderNumber();
    const trackingNumber = generateTrackingNumber();

    // Create the order
    const newOrder = await db.insert(orders).values({
      orderNumber,
      trackingNumber,
      customerName,
      customerPhone,
      customerEmail: customerEmail || null,
      shippingAddress: shippingAddress || null,
      items: JSON.stringify(items),
      totalAmount,
      paymentMethod: paymentMethod || null,
      status: "confirmed",
      paymentStatus: "pending",
      notes: notes || null,
    });

    return NextResponse.json({
      success: true,
      order: {
        orderNumber,
        trackingNumber,
        customerName,
        totalAmount,
        status: "confirmed",
        message: "Your order has been placed successfully!"
      }
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const email = searchParams.get("email");
    const orderNumber = searchParams.get("orderNumber");
    const trackingNumber = searchParams.get("trackingNumber");

    let query = db.select().from(orders).orderBy(desc(orders.createdAt));

    // If customer looking up their order
    if (phone || email || orderNumber || trackingNumber) {
      let conditions = [];
      
      if (phone) {
        conditions.push(eq(orders.customerPhone, phone));
      }
      if (email) {
        conditions.push(eq(orders.customerEmail, email));
      }
      if (orderNumber) {
        conditions.push(eq(orders.orderNumber, orderNumber));
      }
      if (trackingNumber) {
        conditions.push(eq(orders.trackingNumber, trackingNumber));
      }

      if (conditions.length > 0) {
        const allOrders = await db
          .select()
          .from(orders)
          .where(or(...conditions))
          .orderBy(desc(orders.createdAt));
        
        return NextResponse.json({ orders: allOrders });
      }
    }

    // Get all orders (admin)
    const allOrders = await query;
    return NextResponse.json({ orders: allOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
