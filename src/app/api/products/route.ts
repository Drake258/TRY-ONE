import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";

export async function GET(request: NextRequest) {
  try {
    // Fetch all products (public endpoint - no auth required)
    const allProducts = await db.select().from(products);
    
    return NextResponse.json({
      success: true,
      data: allProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
