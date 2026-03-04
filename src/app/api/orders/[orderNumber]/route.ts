import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;

    const orderResults = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber));

    if (orderResults.length === 0) {
      // Try by tracking number
      const trackingResults = await db
        .select()
        .from(orders)
        .where(eq(orders.trackingNumber, orderNumber));
      
      if (trackingResults.length === 0) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }
      
      const order = trackingResults[0];
      return NextResponse.json({
        order: {
          ...order,
          items: JSON.parse(order.items as string)
        }
      });
    }

    const order = orderResults[0];
    return NextResponse.json({
      order: {
        ...order,
        items: JSON.parse(order.items as string)
      }
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const body = await request.json();
    const { status, paymentStatus, notes } = body;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (notes !== undefined) updateData.notes = notes;

    await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.orderNumber, orderNumber));

    // Fetch the updated order
    const updatedOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber));

    if (updatedOrder.length === 0) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      order: {
        ...updatedOrder[0],
        items: JSON.parse(updatedOrder[0].items as string)
      }
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
