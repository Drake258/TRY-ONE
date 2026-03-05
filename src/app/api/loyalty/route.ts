import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers, loyaltyPointsTransactions, loyaltySettings, orders } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// POST - Register/Login customer or process points
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, phone, name, password, orderId, pointsToRedeem, customerId } = body;

    // Get loyalty settings
    const settings = await db.select().from(loyaltySettings).limit(1);
    const loyaltySettingsData = settings[0] || {
      pointsPerCedi: 1.0,
      pointsRedemptionRate: 0.01,
      minPointsToRedeem: 100,
    };

    if (action === "register") {
      // Register new customer
      if (!email || !name) {
        return NextResponse.json(
          { success: false, error: "Email and name required" },
          { status: 400 }
        );
      }

      // Check if customer exists
      const existing = await db
        .select()
        .from(customers)
        .where(eq(customers.email, email))
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json(
          { success: false, error: "Email already registered" },
          { status: 400 }
        );
      }

      const [newCustomer] = await db
        .insert(customers)
        .values({
          email,
          phone,
          name,
          loyaltyPoints: 0,
          totalSpent: 0,
          totalOrders: 0,
        })
        .returning();

      return NextResponse.json({
        success: true,
        customer: newCustomer,
      });
    }

    if (action === "login") {
      // Simple login by email (in production, would verify password)
      if (!email) {
        return NextResponse.json(
          { success: false, error: "Email required" },
          { status: 400 }
        );
      }

      const customer = await db
        .select()
        .from(customers)
        .where(eq(customers.email, email))
        .limit(1);

      if (customer.length === 0) {
        return NextResponse.json(
          { success: false, error: "Customer not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        customer: customer[0],
        settings: loyaltySettingsData,
      });
    }

    if (action === "earn_points" && orderId) {
      // Calculate points earned from order
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

      const pointsEarned = Math.floor(order[0].totalAmount * loyaltySettingsData.pointsPerCedi);
      
      // Get the customer based on phone
      const customerData = await db
        .select()
        .from(customers)
        .where(eq(customers.phone, order[0].customerPhone))
        .limit(1);
      
      if (customerData.length === 0) {
        return NextResponse.json({ success: true, message: "Customer not found, points not awarded" });
      }
      
      const customerId = customerData[0].id;
      
      // Update customer stats
      await db
        .update(customers)
        .set({
          loyaltyPoints: customerData[0].loyaltyPoints + pointsEarned,
          totalSpent: customerData[0].totalSpent + order[0].totalAmount,
          totalOrders: customerData[0].totalOrders + 1,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, customerId));

      // Record transaction
      if (pointsEarned > 0) {
        await db
          .insert(loyaltyPointsTransactions)
          .values({
            customerId: customerId || 0,
            orderId: orderId,
            points: pointsEarned,
            type: "earned",
            description: `Points earned from order ${order[0].orderNumber}`,
          });
      }

      return NextResponse.json({
        success: true,
        pointsEarned,
        message: `${pointsEarned} points earned!`,
      });
    }

    if (action === "redeem_points" && customerId && pointsToRedeem) {
      const customer = await db
        .select()
        .from(customers)
        .where(eq(customers.id, customerId))
        .limit(1);

      if (customer.length === 0) {
        return NextResponse.json(
          { success: false, error: "Customer not found" },
          { status: 404 }
        );
      }

      if (customer[0].loyaltyPoints < pointsToRedeem) {
        return NextResponse.json(
          { success: false, error: "Insufficient points" },
          { status: 400 }
        );
      }

      if (pointsToRedeem < loyaltySettingsData.minPointsToRedeem) {
        return NextResponse.json(
          { success: false, error: `Minimum ${loyaltySettingsData.minPointsToRedeem} points required to redeem` },
          { status: 400 }
        );
      }

      // Calculate discount value
      const discountValue = pointsToRedeem * loyaltySettingsData.pointsRedemptionRate;

      // Deduct points
      await db
        .update(customers)
        .set({
          loyaltyPoints: customer[0].loyaltyPoints - pointsToRedeem,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, customerId));

      // Record transaction
      await db
        .insert(loyaltyPointsTransactions)
        .values({
          customerId,
          points: -pointsToRedeem,
          type: "redeemed",
          description: `Redeemed ${pointsToRedeem} points for ₵${discountValue.toFixed(2)} discount`,
        });

      return NextResponse.json({
        success: true,
        pointsRedeemed: pointsToRedeem,
        discountValue: discountValue.toFixed(2),
        remainingPoints: customer[0].loyaltyPoints - pointsToRedeem,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in loyalty API:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}

// GET - Get customer points and settings
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get("customerId");
    const email = searchParams.get("email");

    // Get loyalty settings
    const settings = await db.select().from(loyaltySettings).limit(1);
    const loyaltySettingsData = settings[0] || {
      pointsPerCedi: 1.0,
      pointsRedemptionRate: 0.01,
      minPointsToRedeem: 100,
    };

    if (customerId) {
      const customer = await db
        .select()
        .from(customers)
        .where(eq(customers.id, parseInt(customerId)))
        .limit(1);

      if (customer.length === 0) {
        return NextResponse.json(
          { success: false, error: "Customer not found" },
          { status: 404 }
        );
      }

      // Get transaction history
      const transactions = await db
        .select()
        .from(loyaltyPointsTransactions)
        .where(eq(loyaltyPointsTransactions.customerId, parseInt(customerId)))
        .orderBy(desc(loyaltyPointsTransactions.createdAt))
        .limit(20);

      return NextResponse.json({
        success: true,
        customer: customer[0],
        transactions,
        settings: loyaltySettingsData,
      });
    }

    if (email) {
      const customer = await db
        .select()
        .from(customers)
        .where(eq(customers.email, email))
        .limit(1);

      if (customer.length === 0) {
        return NextResponse.json({
          success: true,
          customer: null,
          settings: loyaltySettingsData,
        });
      }

      return NextResponse.json({
        success: true,
        customer: customer[0],
        settings: loyaltySettingsData,
      });
    }

    return NextResponse.json({
      success: true,
      settings: loyaltySettingsData,
    });
  } catch (error) {
    console.error("Error getting loyalty data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get data" },
      { status: 500 }
    );
  }
}
