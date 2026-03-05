import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq, and, gt, lt, or } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, orderTotal } = body;

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    // Find the coupon
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase())).limit(1);

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Invalid coupon code" }, { status: 400 });
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, error: "This coupon is no longer active" }, { status: 400 });
    }

    // Check expiration
    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return NextResponse.json({ valid: false, error: "This coupon is not yet valid" }, { status: 400 });
    }
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return NextResponse.json({ valid: false, error: "This coupon has expired" }, { status: 400 });
    }

    // Check usage limits
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: "This coupon has reached its usage limit" }, { status: 400 });
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && orderTotal && parseFloat(orderTotal) < coupon.minOrderAmount) {
      return NextResponse.json({ 
        valid: false, 
        error: `Minimum order of ₵${coupon.minOrderAmount} required for this coupon` 
      }, { status: 400 });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (parseFloat(orderTotal) || 0) * (coupon.discountValue / 100);
    } else {
      discount = coupon.discountValue;
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount: discount.toFixed(2)
      }
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
