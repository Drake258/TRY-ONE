import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getSession, logActivity } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, category, description, price, imageUrl, processor, ram, storage, graphics, operatingSystem, inStock, featured } = body;

    if (!name || !category || price === undefined) {
      return NextResponse.json({ error: "Name, category, and price are required" }, { status: 400 });
    }

    const [product] = await db.insert(products).values({
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
      inStock: inStock !== false,
      featured: featured === true,
      createdBy: session.user.id,
    }).returning();

    await logActivity(session.user.id, session.user.username, "CREATE", "product", String(product.id), `Created product: ${name}`);

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
