import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, and, gte, lte, like, desc, asc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Search and filter parameters
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");
    const minRating = searchParams.get("minRating");
    const sortBy = searchParams.get("sortBy") || "newest"; // newest, price_asc, price_desc, popularity, rating
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions: any[] = [];
    
    // Search query (searches name and description)
    if (query) {
      conditions.push(
        sql`(${products.name} LIKE ${'%' + query + '%'} OR ${products.description} LIKE ${'%' + query + '%'})`
      );
    }
    
    // Category filter
    if (category && category !== "all") {
      // Use SQL for category filter to avoid enum issues
      conditions.push(sql`${products.category} = ${category}`);
    }
    
    // Price range filter
    if (minPrice) {
      conditions.push(gte(products.price, parseFloat(minPrice)));
    }
    if (maxPrice) {
      conditions.push(lte(products.price, parseFloat(maxPrice)));
    }
    
    // Stock filter
    if (inStock === "true") {
      conditions.push(eq(products.inStock, true));
    } else if (inStock === "false") {
      conditions.push(eq(products.inStock, false));
    }
    
    // Rating filter
    if (minRating) {
      conditions.push(gte(products.rating, parseFloat(minRating)));
    }

    // Build order by
    let orderBy;
    switch (sortBy) {
      case "price_asc":
        orderBy = asc(products.price);
        break;
      case "price_desc":
        orderBy = desc(products.price);
        break;
      case "popularity":
        orderBy = desc(products.popularity);
        break;
      case "rating":
        orderBy = desc(products.rating);
        break;
      case "newest":
      default:
        orderBy = desc(products.createdAt);
    }

    // Execute query
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const [productsList, totalCount] = await Promise.all([
      db
        .select()
        .from(products)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(whereClause)
    ]);

    const total = totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: productsList,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search products" },
      { status: 500 }
    );
  }
}

// POST for suggestions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    // Get suggestions based on product name
    const suggestions = await db
      .select({
        id: products.id,
        name: products.name,
        category: products.category,
        price: products.price,
        inStock: products.inStock,
      })
      .from(products)
      .where(
        sql`${products.name} LIKE ${'%' + query + '%'}`
      )
      .limit(5);

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("Error getting suggestions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get suggestions" },
      { status: 500 }
    );
  }
}
