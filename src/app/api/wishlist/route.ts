import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { wishlist, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET: Get wishlist items for a session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const items = await db.select({
      id: wishlist.id,
      productId: wishlist.productId,
      createdAt: wishlist.createdAt,
      product: {
        id: products.id,
        name: products.name,
        price: products.price,
        imageUrl: products.imageUrl,
        inStock: products.inStock,
        stockQuantity: products.stockQuantity,
      }
    })
      .from(wishlist)
      .leftJoin(products, eq(wishlist.productId, products.id))
      .where(eq(wishlist.sessionId, sessionId));

    return NextResponse.json({ wishlist: items });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

// POST: Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, productId } = body;

    if (!sessionId || !productId) {
      return NextResponse.json({ error: "Session ID and product ID are required" }, { status: 400 });
    }

    // Check if already in wishlist
    const existing = await db.select()
      .from(wishlist)
      .where(and(
        eq(wishlist.sessionId, sessionId),
        eq(wishlist.productId, productId)
      ))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "Item already in wishlist" }, { status: 400 });
    }

    const [item] = await db.insert(wishlist).values({
      sessionId,
      productId,
    }).returning();

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
  }
}

// DELETE: Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const sessionId = searchParams.get("sessionId");
    const productId = searchParams.get("productId");

    if (!id && (!sessionId || !productId)) {
      return NextResponse.json({ error: "ID or sessionId+productId required" }, { status: 400 });
    }

    if (id) {
      await db.delete(wishlist).where(eq(wishlist.id, parseInt(id)));
    } else {
      await db.delete(wishlist)
        .where(and(
          eq(wishlist.sessionId, sessionId!),
          eq(wishlist.productId, parseInt(productId!))
        ));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
