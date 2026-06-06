import { getProducts } from "./actions";
import { OrderForm } from "@/components/orders/order-form";

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Famton</h1>
        <p className="mt-2 text-sm text-gray-600">
          ファミリーバドミントン用品 ご注文フォーム
        </p>
      </div>
      <OrderForm products={products} />
    </main>
  );
}
