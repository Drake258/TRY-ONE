import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invoices, orders } from "@/db/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

// POST - Generate invoice from order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, orderId, invoiceId } = body;

    if (action === "generate" && orderId) {
      // Get order details
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (order.length === 0) {
        return NextResponse.json(
          { success: false, error: "Order not found" },
          { status: 404 }
        );
      }

      const orderData = order[0];

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Check if invoice already exists
      const existingInvoice = await db
        .select()
        .from(invoices)
        .where(eq(invoices.orderId, orderId))
        .limit(1);

      if (existingInvoice.length > 0) {
        return NextResponse.json({
          success: true,
          invoice: existingInvoice[0],
          message: "Invoice already exists",
        });
      }

      // Calculate totals
      const subtotal = orderData.totalAmount + (orderData.discount || 0);
      const tax = 0; // No tax in Ghana currently
      const total = orderData.totalAmount;

      // Create invoice
      const [invoice] = await db
        .insert(invoices)
        .values({
          invoiceNumber,
          orderId: orderData.id,
          orderNumber: orderData.orderNumber,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail || undefined,
          customerPhone: orderData.customerPhone,
          billingAddress: orderData.billingAddress || orderData.shippingAddress || undefined,
          items: orderData.items,
          subtotal,
          discount: orderData.discount,
          tax,
          total,
          paymentMethod: orderData.paymentMethod || undefined,
          paymentReference: orderData.paymentReference || undefined,
          status: "issued",
        })
        .returning();

      return NextResponse.json({
        success: true,
        invoice,
      });
    }

    if (action === "mark_paid" && invoiceId) {
      await db
        .update(invoices)
        .set({
          status: "paid",
          paidAt: new Date(),
        })
        .where(eq(invoices.id, invoiceId));

      return NextResponse.json({
        success: true,
        message: "Invoice marked as paid",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in invoice API:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}

// GET - Get invoices
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const invoiceId = searchParams.get("invoiceId");
    const orderNumber = searchParams.get("orderNumber");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (invoiceId) {
      const invoice = await db
        .select()
        .from(invoices)
        .where(eq(invoices.id, parseInt(invoiceId)))
        .limit(1);

      if (invoice.length === 0) {
        return NextResponse.json(
          { success: false, error: "Invoice not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        invoice: invoice[0],
      });
    }

    if (orderNumber) {
      const invoice = await db
        .select()
        .from(invoices)
        .where(eq(invoices.orderNumber, orderNumber))
        .limit(1);

      if (invoice.length === 0) {
        return NextResponse.json(
          { success: false, error: "Invoice not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        invoice: invoice[0],
      });
    }

    // Get all invoices with optional date range
    let conditions: any[] = [];
    if (startDate) {
      conditions.push(gte(invoices.createdAt, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(invoices.createdAt, new Date(endDate)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (page - 1) * limit;

    const [invoicesList, totalCount] = await Promise.all([
      db
        .select()
        .from(invoices)
        .where(whereClause)
        .orderBy(desc(invoices.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(invoices)
        .where(whereClause),
    ]);

    // Calculate totals
    const totalAmount = await db
      .select({ total: sql<number>`SUM(${invoices.total})` })
      .from(invoices)
      .where(whereClause);

    const total = totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: invoicesList,
      summary: {
        totalInvoices: total,
        totalAmount: totalAmount[0]?.total || 0,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error getting invoices:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get invoices" },
      { status: 500 }
    );
  }
}
