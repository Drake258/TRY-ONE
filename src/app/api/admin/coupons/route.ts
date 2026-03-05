import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq, desc, and, gt, lt, or } from "drizzle-orm";
import { getSession, logActivity } from "@/lib/auth";

// GET: Get all coupons
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const allCoupons = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
    return NextResponse.json({ coupons: allCoupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

// POST: Create a new coupon
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { 
      code, 
      description, 
      discountType, 
      discountValue, 
      minOrderAmount, 
      maxUses, 
      maxUsesPerUser,
      validFrom,
      validUntil,
      isActive 
    } = body;

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: "Code, discount type, and discount value are required" }, { status: 400 });
    }

    // Check if code already exists
    const existing = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase())).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
    }

    const [coupon] = await db.insert(coupons).values({
      code: code.toUpperCase(),
      description: description || null,
      discountType,
      discountValue: parseFloat(discountValue),
      minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
      maxUses: maxUses ? parseInt(maxUses) : null,
      maxUsesPerUser: maxUsesPerUser ? parseInt(maxUsesPerUser) : null,
      validFrom: validFrom ? new Date(validFrom) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
      isActive: isActive !== false,
    }).returning();

    await logActivity(session.user.id, session.user.username, "CREATE", "coupon", String(coupon.id), `Created coupon: ${code}`);

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error("Create coupon error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update a coupon
export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    // Build update object
    const updateData: any = { updatedAt: new Date() };
    
    if (updates.code !== undefined) updateData.code = updates.code.toUpperCase();
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.discountType !== undefined) updateData.discountType = updates.discountType;
    if (updates.discountValue !== undefined) updateData.discountValue = parseFloat(updates.discountValue);
    if (updates.minOrderAmount !== undefined) updateData.minOrderAmount = updates.minOrderAmount ? parseFloat(updates.minOrderAmount) : null;
    if (updates.maxUses !== undefined) updateData.maxUses = updates.maxUses ? parseInt(updates.maxUses) : null;
    if (updates.maxUsesPerUser !== undefined) updateData.maxUsesPerUser = updates.maxUsesPerUser ? parseInt(updates.maxUsesPerUser) : null;
    if (updates.validFrom !== undefined) updateData.validFrom = updates.validFrom ? new Date(updates.validFrom) : null;
    if (updates.validUntil !== undefined) updateData.validUntil = updates.validUntil ? new Date(updates.validUntil) : null;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

    await db.update(coupons).set(updateData).where(eq(coupons, id));

    await logActivity(session.user.id, session.user.username, "UPDATE", "coupon", String(id), `Updated coupon`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update coupon error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete a coupon
export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    await db.delete(coupons).where(eq(coupons.id, parseInt(id)));

    await logActivity(session.user.id, session.user.username, "DELETE", "coupon", id, `Deleted coupon`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
