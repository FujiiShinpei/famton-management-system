import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProducts } from "../actions";
import { OrderForm } from "@/components/orders/order-form";
import { DelayNotice } from "@/components/delay-notice";

// 常に最新の Google Sheets データを参照する（ビルド時の静的生成を無効化）
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "ご注文フォーム｜Famton",
};

export default async function OrderPage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto mb-4">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft className="h-4 w-4" />
          トップページへ戻る
        </Link>
      </div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Famton</h1>
        <p className="mt-2 text-sm text-gray-600">
          ファミリーバドミントン用品 ご注文フォーム
        </p>
      </div>
      <DelayNotice className="max-w-md mx-auto mb-2" />
      <OrderForm products={products} />
    </main>
  );
}
