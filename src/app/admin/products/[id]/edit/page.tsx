import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) notFound();

  const result = await db.select().from(products).where(eq(products.id, productId));
  if (result.length === 0) notFound();

  const product = result[0];

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
          <Link href="/admin/products" className="hover:text-white transition">Products</Link>
          <span>/</span>
          <span className="text-white">Edit</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Edit Product</h1>
        <p className="text-gray-400 mt-1">Update the details for <span className="text-white">{product.name}</span></p>
      </div>
      <div className="max-w-3xl">
        <ProductForm
          initialData={{
            id: product.id,
            name: product.name,
            category: product.category,
            description: product.description || "",
            price: product.price.toString(),
            imageUrl: product.imageUrl || "",
            processor: product.processor || "",
            ram: product.ram || "",
            storage: product.storage || "",
            graphics: product.graphics || "",
            operatingSystem: product.operatingSystem || "",
            inStock: product.inStock,
            featured: product.featured,
          }}
        />
      </div>
    </div>
  );
}
