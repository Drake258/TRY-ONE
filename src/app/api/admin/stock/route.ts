import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stockHistory, stockAlerts, products } from "@/db/schema";
import { eq, desc, and, gt, or } from "drizzle-orm";
import { getSession, logActivity } from "@/lib/auth";

// GET: Get stock history for a product or all products
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const type = searchParams.get("type"); // 'history' or 'alerts'

    if (type === "alerts") {
      // Get unread stock alerts
      const unread = searchParams.get("unread") === "true";
      let query = db.select({
        id: stockAlerts.id,
        productId: stockAlerts.productId,
        alertType: stockAlerts.alertType,
        message: stockAlerts.message,
        isRead: stockAlerts.isRead,
        isResolved: stockAlerts.isResolved,
        createdAt: stockAlerts.createdAt,
        productName: products.name,
      })
        .from(stockAlerts)
        .leftJoin(products, eq(stockAlerts.productId, products.id))
        .orderBy(desc(stockAlerts.createdAt));

      if (unread) {
        query = query.where(eq(stockAlerts.isRead, false)) as any;
      }

      const alerts = await query;
      return NextResponse.json({ alerts });
    }

    // Get stock history
    let query = db.select({
      id: stockHistory.id,
      productId: stockHistory.productId,
      changeType: stockHistory.changeType,
      quantity: stockHistory.quantity,
      previousStock: stockHistory.previousStock,
      newStock: stockHistory.newStock,
      reason: stockHistory.reason,
      orderId: stockHistory.orderId,
      createdAt: stockHistory.createdAt,
      productName: products.name,
    })
      .from(stockHistory)
      .leftJoin(products, eq(stockHistory.productId, products.id))
      .orderBy(desc(stockHistory.createdAt));

    if (productId) {
      query = query.where(eq(stockHistory.productId, parseInt(productId))) as any;
    }

    const history = await query;
    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}

// POST: Create a stock adjustment (restock, adjustment, etc.)
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { productId, changeType, quantity, reason } = body;

    if (!productId || !changeType || quantity === undefined) {
      return NextResponse.json({ error: "Product ID, change type, and quantity are required" }, { status: 400 });
    }

    if (!["restock", "adjustment", "return", "damage"].includes(changeType)) {
      return NextResponse.json({ error: "Invalid change type" }, { status: 400 });
    }

    // Get current product
    const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const previousStock = product.stockQuantity || 0;
    let newStock: number;

    if (changeType === "damage" || changeType === "adjustment") {
      // For damage/adjustment, quantity can be negative
      newStock = Math.max(0, previousStock + parseInt(quantity));
    } else {
      // For restock/return, quantity is added
      newStock = previousStock + parseInt(quantity);
    }

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
      changeType,
      quantity: parseInt(quantity),
      previousStock,
      newStock,
      reason: reason || null,
      performedBy: session.user.id,
    });

    // Handle alerts
    if (newStock === 0 && previousStock > 0) {
      // Out of stock - create alert
      const existingAlert = await db.select()
        .from(stockAlerts)
        .where(and(
          eq(stockAlerts.productId, productId),
          eq(stockAlerts.alertType, "out_of_stock"),
          eq(stockAlerts.isResolved, false)
        ));

      if (existingAlert.length === 0) {
        await db.insert(stockAlerts).values({
          productId,
          alertType: "out_of_stock",
          message: `Out of stock: ${product.name} is now out of stock`,
        });
      }
    } else if (newStock > 0 && newStock <= product.lowStockThreshold) {
      // Low stock - create alert
      const existingAlert = await db.select()
        .from(stockAlerts)
        .where(and(
          eq(stockAlerts.productId, productId),
          eq(stockAlerts.alertType, "low_stock"),
          eq(stockAlerts.isResolved, false)
        ));

      if (existingAlert.length === 0) {
        await db.insert(stockAlerts).values({
          productId,
          alertType: "low_stock",
          message: `Low stock: ${product.name} has only ${newStock} units left`,
        });
      }
    }

    await logActivity(session.user.id, session.user.username, "STOCK_ADJUST", "product", String(productId), 
      `${changeType}: ${quantity} units (${previousStock} -> ${newStock})`);

    return NextResponse.json({ 
      success: true, 
      message: `Stock ${changeType} successful`,
      previousStock,
      newStock 
    });
  } catch (error) {
    console.error("Stock adjustment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH: Mark stock alerts as read/resolved
export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { alertId, action } = body;

    if (!alertId || !action) {
      return NextResponse.json({ error: "Alert ID and action are required" }, { status: 400 });
    }

    if (action === "read") {
      await db.update(stockAlerts)
        .set({ isRead: true })
        .where(eq(stockAlerts.id, alertId));
    } else if (action === "resolve") {
      await db.update(stockAlerts)
        .set({ isResolved: true, resolvedAt: new Date() })
        .where(eq(stockAlerts.id, alertId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating alert:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
