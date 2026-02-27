import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
          <Link href="/admin/products" className="hover:text-white transition">Products</Link>
          <span>/</span>
          <span className="text-white">New Product</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Add New Product</h1>
        <p className="text-gray-400 mt-1">Fill in the details to add a new product to your catalog.</p>
      </div>
      <div className="max-w-3xl">
        <ProductForm />
      </div>
    </div>
  );
}
