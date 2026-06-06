'use client'

import { useState } from 'react'
import { Order, Product, Expense } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { payWorkers } from "@/app/actions"
import { toast } from "sonner"

interface PayrollSummaryProps {
    orders: Order[]
    products: Product[]
    expenses?: Expense[]
}

export function PayrollSummary({ orders, products, expenses = [] }: PayrollSummaryProps) {
    const unpaidOrders = orders.filter(o => o.status === '発送済' && !o.is_paid_to_worker)
    const unpaidAdvances = expenses.filter(e => e.is_advance && !e.is_advance_paid)

    // 工賃のみ（product.labor_cost × quantity）
    const laborOnlyTotal = unpaidOrders.reduce((sum, order) => {
        const product = products.find(p => p.id === order.product_id)
        const laborCost = product ? product.labor_cost : 0
        return sum + laborCost * order.quantity
    }, 0)

    // 発送時の建て替え送料のみ
    const shippingAdvanceTotal = unpaidOrders.reduce((sum, order) => {
        return sum + (order.advanced_shipping_cost || 0)
    }, 0)

    const laborTotal = laborOnlyTotal + shippingAdvanceTotal  // 表示用合計
    const advanceTotal = unpaidAdvances.reduce((sum, e) => sum + e.amount, 0)
    const totalUnpaid = laborTotal + advanceTotal

    const [loading, setLoading] = useState(false)

    async function handlePay() {
        if (totalUnpaid === 0) return
        if (!confirm(`合計 ¥${totalUnpaid.toLocaleString()} の支払いを実行しますか？`)) return

        setLoading(true)
        try {
            const orderIds = unpaidOrders.map(o => o.id)
            const expenseIds = unpaidAdvances.map(e => e.id)

            await payWorkers(orderIds, expenseIds, laborOnlyTotal, shippingAdvanceTotal)
            toast.success("支払いを完了しました")
        } catch (e) {
            console.error(e)
            toast.error("支払いの処理に失敗しました")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>未払い工賃の集計 (Payroll)</CardTitle>
                <CardDescription>発送済みの製造費・立替金の合計</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="text-4xl font-bold">
                    ¥{totalUnpaid.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                    <div className="flex justify-between">
                        <span>工賃（給料）</span>
                        <span>¥{laborOnlyTotal.toLocaleString()}</span>
                    </div>
                    {shippingAdvanceTotal > 0 && (
                        <div className="flex justify-between">
                            <span>建て替え送料（荷造運賃）</span>
                            <span>¥{shippingAdvanceTotal.toLocaleString()}</span>
                        </div>
                    )}
                    {advanceTotal > 0 && (
                        <div className="flex justify-between">
                            <span>立替金（未精算）</span>
                            <span>¥{advanceTotal.toLocaleString()} / {unpaidAdvances.length}件</span>
                        </div>
                    )}
                    <div className="flex justify-between font-medium border-t pt-1">
                        <span>対象注文</span>
                        <span>{unpaidOrders.length}件</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handlePay} disabled={totalUnpaid === 0 || loading} className="w-full">
                    {loading ? "処理中..." : "支払いを実行 (記録)"}
                </Button>
            </CardFooter>
        </Card>
    )
}
