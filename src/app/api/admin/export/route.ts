import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, users, activityLogs } from "@/db/schema";
import { getSession } from "@/lib/auth";

function toCSV(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const escape = (val: string | number | boolean | null | undefined) => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const lines = [headers.join(","), ...rows.map((row) => row.map(escape).join(","))];
  return lines.join("\n");
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    let csv = "";
    let filename = "";

    if (type === "products") {
      const data = await db.select().from(products);
      csv = toCSV(
        ["ID", "Name", "Category", "Price", "In Stock", "Featured", "Processor", "RAM", "Storage", "Graphics", "OS", "Description", "Created At"],
        data.map((p) => [p.id, p.name, p.category, p.price, p.inStock, p.featured, p.processor, p.ram, p.storage, p.graphics, p.operatingSystem, p.description, p.createdAt?.toISOString()])
      );
      filename = `products_${new Date().toISOString().split("T")[0]}.csv`;
    } else if (type === "users") {
      const data = await db.select({ id: users.id, username: users.username, role: users.role, status: users.status, createdAt: users.createdAt, lastLogin: users.lastLogin }).from(users);
      csv = toCSV(
        ["ID", "Username", "Role", "Status", "Created At", "Last Login"],
        data.map((u) => [u.id, u.username, u.role, u.status, u.createdAt?.toISOString(), u.lastLogin?.toISOString()])
      );
      filename = `users_${new Date().toISOString().split("T")[0]}.csv`;
    } else if (type === "logs") {
      const data = await db.select().from(activityLogs);
      csv = toCSV(
        ["ID", "User ID", "Username", "Action", "Resource", "Resource ID", "Details", "Timestamp"],
        data.map((l) => [l.id, l.userId, l.username, l.action, l.resource, l.resourceId, l.details, l.createdAt?.toISOString()])
      );
      filename = `activity_logs_${new Date().toISOString().split("T")[0]}.csv`;
    } else {
      return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
