import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products, stockHistory, stockAlerts } from "@/db/schema";
import { eq, or, ilike, desc, and } from "drizzle-orm";

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

// Function to reduce stock when order is placed
async function reduceStock(items: any[], orderId: number, orderNumber: string) {
  for (const item of items) {
    const productId = item.id || item.productId;
    if (!productId) continue;

    const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!product) continue;

    const quantity = item.quantity || 1;
    const previousStock = product.stockQuantity || 0;
    const newStock = Math.max(0, previousStock - quantity);

    // Update product stock
    await db.update(products)
      .set({
        stockQuantity: newStock,
        inStock: newStock > 0,
        updatedAt: new Date()
      })
      .where(eq(products.id, productId));

    // Record stock history
    await db.insert(stockHistory).values({
      productId,
      changeType: "sale",
      quantity: -quantity,
      previousStock,
      newStock,
      reason: `Order ${orderNumber}`,
      orderId,
    });

    // Check for low stock alert
    if (newStock > 0 && newStock <= product.lowStockThreshold) {
      // Check if alert already exists
      const existingAlerts = await db.select()
        .from(stockAlerts)
        .where(and(
          eq(stockAlerts.productId, productId),
          eq(stockAlerts.isResolved, false)
        ));

      if (existingAlerts.length === 0) {
        await db.insert(stockAlerts).values({
          productId,
          alertType: "low_stock",
          message: `Low stock alert: ${product.name} has only ${newStock} units left`,
        });
      }
    }

    // Check for out of stock
    if (newStock === 0 && previousStock > 0) {
      const existingOutOfStock = await db.select()
        .from(stockAlerts)
        .where(and(
          eq(stockAlerts.productId, productId),
          eq(stockAlerts.alertType, "out_of_stock"),
          eq(stockAlerts.isResolved, false)
        ));

      if (existingOutOfStock.length === 0) {
        await db.insert(stockAlerts).values({
          productId,
          alertType: "out_of_stock",
          message: `Out of stock: ${product.name} is now out of stock`,
        });
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      customerName, 
      customerPhone, 
      customerEmail, 
      shippingAddress,
      billingAddress,
      city,
      region,
      items, 
      totalAmount, 
      paymentMethod, 
      notes,
      promoCode,
      discount,
      paymentReference
    } = body;

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
    const [newOrder] = await db.insert(orders).values({
      orderNumber,
      trackingNumber,
      customerName,
      customerPhone,
      customerEmail: customerEmail || null,
      shippingAddress: shippingAddress || null,
      billingAddress: billingAddress || null,
      city: city || null,
      region: region || null,
      items: JSON.stringify(items),
      totalAmount,
      discount: discount || null,
      promoCode: promoCode || null,
      paymentMethod: paymentMethod || null,
      paymentReference: paymentReference || null,
      status: "confirmed",
      paymentStatus: "pending",
      notes: notes || null,
    }).returning();

    // Reduce stock for each item in the order
    await reduceStock(items, newOrder.id, orderNumber);

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
