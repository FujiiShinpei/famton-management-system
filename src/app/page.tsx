import { getProducts } from "./actions";
import { OrderForm } from "@/components/orders/order-form";

// 常に最新の Google Sheets データを参照する（ビルド時の静的生成を無効化）
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
