import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, recentlyViewed, productRecommendations, orders } from "@/db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

// GET recommendations - main endpoint
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId") || "anonymous";
    const type = searchParams.get("type") || "recommended"; // also_bought, recommended, similar, recently_viewed
    const productId = searchParams.get("productId");
    const limit = parseInt(searchParams.get("limit") || "6");

    let recommendations: any[] = [];

    switch (type) {
      case "also_bought":
        // Get products that are frequently bought together
        if (productId) {
          recommendations = await getAlsoBought(parseInt(productId), limit);
        }
        break;

      case "similar":
        // Get similar products based on category
        if (productId) {
          recommendations = await getSimilarProducts(parseInt(productId), limit);
        }
        break;

      case "recently_viewed":
        // Get recently viewed products
        recommendations = await getRecentlyViewed(sessionId, limit);
        break;

      case "recommended":
      default:
        // Get personalized recommendations based on viewing history and popularity
        recommendations = await getRecommendedForYou(sessionId, limit);
        break;
    }

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}

// POST - Track product view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, productId, productIds } = body;

    if (action === "track_view" && sessionId && productId) {
      // Record product view
      await db.insert(recentlyViewed).values({
        sessionId,
        productId: parseInt(productId),
      }).onConflictDoNothing();

      // Update product popularity
      await db
        .update(products)
        .set({
          popularity: sql`${products.popularity} + 1`,
        })
        .where(eq(products.id, parseInt(productId)));

      return NextResponse.json({ success: true });
    }

    if (action === "get_recommendations" && productIds && productIds.length > 0) {
      // Get recommendations based on products in cart
      const recommendations = await getRecommendationsForCart(productIds, 6);
      return NextResponse.json({
        success: true,
        data: recommendations,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in recommendations POST:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}

// Helper functions
async function getAlsoBought(productId: number, limit: number): Promise<any[]> {
  // Check if we have explicit recommendations
  const explicitRecs = await db
    .select()
    .from(productRecommendations)
    .where(
      and(
        eq(productRecommendations.sourceProductId, productId),
        eq(productRecommendations.recommendationType, "also_bought")
      )
    )
    .orderBy(desc(productRecommendations.score))
    .limit(limit);

  if (explicitRecs.length > 0) {
    const productIds = explicitRecs.map((r) => r.recommendedProductId);
    return db
      .select()
      .from(products)
      .where(and(eq(products.inStock, true), inArray(products.id, productIds)))
      .limit(limit);
  }

  // Fallback: Get popular products from same category
  const sourceProduct = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (sourceProduct.length === 0) return [];

  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.category, sourceProduct[0].category),
        eq(products.inStock, true),
        sql`${products.id} != ${productId}`
      )
    )
    .orderBy(desc(products.popularity))
    .limit(limit);
}

async function getSimilarProducts(productId: number, limit: number): Promise<any[]> {
  const sourceProduct = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (sourceProduct.length === 0) return [];

  // Get products from same category
  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.category, sourceProduct[0].category),
        eq(products.inStock, true),
        sql`${products.id} != ${productId}`
      )
    )
    .orderBy(desc(products.popularity))
    .limit(limit);
}

async function getRecentlyViewed(sessionId: string, limit: number): Promise<any[]> {
  const viewed = await db
    .select({ productId: recentlyViewed.productId })
    .from(recentlyViewed)
    .where(eq(recentlyViewed.sessionId, sessionId))
    .groupBy(recentlyViewed.productId)
    .orderBy(desc(recentlyViewed.viewedAt))
    .limit(limit);

  if (viewed.length === 0) return [];

  const productIds = viewed.map((v) => v.productId);
  return db
    .select()
    .from(products)
    .where(inArray(products.id, productIds));
}

async function getRecommendedForYou(sessionId: string, limit: number): Promise<any[]> {
  // First check recently viewed
  const viewed = await db
    .select({ productId: recentlyViewed.productId })
    .from(recentlyViewed)
    .where(eq(recentlyViewed.sessionId, sessionId))
    .groupBy(recentlyViewed.productId)
    .orderBy(desc(recentlyViewed.viewedAt))
    .limit(3);

  if (viewed.length > 0) {
    // Get categories of recently viewed products
    const viewedProducts = await db
      .select({ category: products.category })
      .from(products)
      .where(inArray(products.id, viewed.map((v) => v.productId)));

    const categories = [...new Set(viewedProducts.map((p) => p.category))];

    if (categories.length > 0) {
      // Get popular products from viewed categories
      return db
        .select()
        .from(products)
        .where(
          and(
            eq(products.inStock, true),
            inArray(products.category, categories)
          )
        )
        .orderBy(desc(products.popularity))
        .limit(limit);
    }
  }

  // Fallback: Get popular and featured products
  return db
    .select()
    .from(products)
    .where(eq(products.inStock, true))
    .orderBy(desc(products.featured), desc(products.popularity))
    .limit(limit);
}

async function getRecommendationsForCart(productIds: number[], limit: number): Promise<any[]> {
  if (productIds.length === 0) return [];

  // Get categories of products in cart
  const cartProducts = await db
    .select({ category: products.category })
    .from(products)
    .where(inArray(products.id, productIds));

  const categories = [...new Set(cartProducts.map((p) => p.category))];

  if (categories.length > 0) {
    return db
      .select()
      .from(products)
      .where(
        and(
          eq(products.inStock, true),
          inArray(products.category, categories),
          sql`${products.id} NOT IN (${productIds.join(',')})`
        )
      )
      .orderBy(desc(products.popularity))
      .limit(limit);
  }

  return [];
}
