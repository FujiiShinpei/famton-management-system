import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrders, getProducts } from "@/app/actions";
import { OrderList } from "@/components/factory/order-list";

// 常に最新の Google Sheets データを参照する（ビルド時の静的生成を無効化）
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FactoryOrdersPage() {
    const orders = await getOrders();
    const products = await getProducts();

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <Button variant="ghost" asChild>
                    <Link href="/factory" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        工場メニューに戻る
                    </Link>
                </Button>
            </div>
            <h1 className="text-2xl font-bold mb-6">注文状況の確認</h1>
            <OrderList initialOrders={orders} products={products} />
        </div>
    );
}
