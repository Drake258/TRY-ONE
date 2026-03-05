import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession, logActivity } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const productId = parseInt(id);
  if (isNaN(productId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const body = await request.json();
    const { name, category, description, price, imageUrl, processor, ram, storage, graphics, operatingSystem, inStock, featured, stockQuantity, lowStockThreshold } = body;

    const [updated] = await db.update(products).set({
      name,
      category,
      description: description || null,
      price: parseFloat(price),
      imageUrl: imageUrl || null,
      processor: processor || null,
      ram: ram || null,
      storage: storage || null,
      graphics: graphics || null,
      operatingSystem: operatingSystem || null,
      inStock,
      featured,
      stockQuantity: stockQuantity !== undefined ? stockQuantity : undefined,
      lowStockThreshold: lowStockThreshold !== undefined ? lowStockThreshold : undefined,
      updatedAt: new Date(),
    }).where(eq(products.id, productId)).returning();

    if (!updated) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    await logActivity(session.user.id, session.user.username, "UPDATE", "product", String(productId), `Updated product: ${name}`);

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const productId = parseInt(id);
  if (isNaN(productId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const existing = await db.select().from(products).where(eq(products.id, productId));
    if (existing.length === 0) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    await db.delete(products).where(eq(products.id, productId));
    await logActivity(session.user.id, session.user.username, "DELETE", "product", String(productId), `Deleted product: ${existing[0].name}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
