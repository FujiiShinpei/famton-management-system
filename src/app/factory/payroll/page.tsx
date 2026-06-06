import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrders, getProducts, getExpenses } from "@/app/actions";
import { PayrollSummary } from "@/components/admin/payroll-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// 常に最新の Google Sheets データを参照する（ビルド時の静的生成を無効化）
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FactoryPayrollPage() {
    const [orders, products, expenses] = await Promise.all([
        getOrders(),
        getProducts(),
        getExpenses(),
    ]);

    const unpaidOrders = orders.filter(o => o.status === '発送済' && !o.is_paid_to_worker);
    const unpaidAdvances = expenses.filter(e => e.is_advance && !e.is_advance_paid);

    return (
        <div className="container mx-auto py-8 px-4 space-y-6">
            <div className="mb-6">
                <Button variant="ghost" asChild>
                    <Link href="/factory" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        工場メニューに戻る
                    </Link>
                </Button>
            </div>

            <h1 className="text-2xl font-bold">未払い工賃の確認</h1>

            <PayrollSummary orders={orders} products={products} expenses={expenses} />

            {/* 製造費 */}
            <div>
                <h2 className="text-lg font-semibold mb-4">未払い製造費 ({unpaidOrders.length}件)</h2>
                {unpaidOrders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">未払いの製造費はありません</p>
                ) : (
                    <div className="space-y-3">
                        {unpaidOrders.map(order => {
                            const product = products.find(p => p.id === order.product_id);
                            const laborCost = product ? product.labor_cost * order.quantity : 0;
                            const shippingAdvance = order.advanced_shipping_cost || 0;
                            const total = laborCost + shippingAdvance;

                            return (
                                <Card key={order.id}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium flex justify-between items-center">
                                            <span>{order.customer_name}</span>
                                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                                                ¥{total.toLocaleString()}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-muted-foreground space-y-1">
                                        <div className="flex justify-between">
                                            <span>{product?.name ?? order.product_id} × {order.quantity}</span>
                                            <span>工賃 ¥{laborCost.toLocaleString()}</span>
                                        </div>
                                        {shippingAdvance > 0 && (
                                            <div className="flex justify-between">
                                                <span>送料建て替え</span>
                                                <span>¥{shippingAdvance.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-400">
                                            {new Date(order.created_at).toLocaleDateString('ja-JP')} 注文
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 立替金 */}
            <div>
                <h2 className="text-lg font-semibold mb-4">未精算の立替金 ({unpaidAdvances.length}件)</h2>
                {unpaidAdvances.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">未精算の立替金はありません</p>
                ) : (
                    <div className="space-y-3">
                        {unpaidAdvances.map(expense => (
                            <Card key={expense.id}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span>{expense.category}</span>
                                            <Badge variant="destructive" className="text-xs">未精算</Badge>
                                        </div>
                                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                                            ¥{expense.amount.toLocaleString()}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground space-y-1">
                                    <p>{expense.description}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(expense.date).toLocaleDateString('ja-JP')} 登録
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
