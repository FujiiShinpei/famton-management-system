'use client'

import { Order, Expense } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, JapaneseYen, AlertCircle, Package, ShoppingCart } from "lucide-react"

interface KpiCardsProps {
    orders: Order[]
    expenses: Expense[]
    targetYear?: number
}

export function KpiCards({ orders, expenses, targetYear }: KpiCardsProps) {
    const now = new Date()
    const currentYear = now.getFullYear()
    const displayYear = targetYear || currentYear

    // 年内に含まれるか判定
    const isTargetYear = (dateStr: string) => {
        if (!dateStr) return false
        const d = new Date(dateStr)
        if (isNaN(d.getTime())) return false
        
        return d.getFullYear() === displayYear
    }

    const validOrders = orders.filter(o => o.status !== 'キャンセル')

    // 選択年の売上と数量
    const targetOrders = validOrders.filter(o => isTargetYear(o.created_at))
    const yearlySales = targetOrders.reduce((sum, o) => sum + (o.amount || 0), 0)
    const yearlyQuantity = targetOrders.reduce((sum, o) => sum + (o.quantity || 0), 0)

    // 選択年の経費
    const yearlyExpenses = expenses
        .filter(e => isTargetYear(e.date))
        .reduce((sum, e) => sum + (e.amount || 0), 0)

    const yearlyProfit = yearlySales - yearlyExpenses

    // これらは全期間の現在の状態
    const unpaidOrders = validOrders.filter(o => o.payment_status === '未入金')
    const unpaidAmount = unpaidOrders.reduce((sum, o) => sum + (o.amount || 0), 0)
    const pendingOrders = orders.filter(o => o.status === '未対応' || o.status === '製造中').length

    const items = [
        {
            title: `${displayYear}年の売上`,
            value: `¥${yearlySales.toLocaleString()}`,
            icon: <TrendingUp className="h-5 w-5" />,
            accent: 'text-blue-600',
            bg: 'bg-blue-50',
            sub: `数量: ${yearlyQuantity.toLocaleString()}点`,
        },
        {
            title: `${displayYear}年の利益`,
            value: `¥${yearlyProfit.toLocaleString()}`,
            icon: <JapaneseYen className="h-5 w-5" />,
            accent: yearlyProfit >= 0 ? 'text-green-600' : 'text-red-600',
            bg: yearlyProfit >= 0 ? 'bg-green-50' : 'bg-red-50',
            sub: `経費 ¥${yearlyExpenses.toLocaleString()}`,
        },
        {
            title: '未入金額',
            value: `¥${unpaidAmount.toLocaleString()}`,
            icon: <AlertCircle className="h-5 w-5" />,
            accent: unpaidAmount > 0 ? 'text-orange-600' : 'text-gray-500',
            bg: 'bg-orange-50',
            sub: `${unpaidOrders.length}件`,
        },
        {
            title: '対応中の注文',
            value: `${pendingOrders}件`,
            icon: <Package className="h-5 w-5" />,
            accent: 'text-purple-600',
            bg: 'bg-purple-50',
            sub: '未対応・製造中',
        },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map(item => (
                <Card key={item.title}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">{item.title}</span>
                            <div className={`${item.bg} ${item.accent} p-2 rounded-full`}>
                                {item.icon}
                            </div>
                        </div>
                        <div className={`text-2xl font-bold ${item.accent}`}>{item.value}</div>
                        <div className="text-xs text-muted-foreground mt-1">{item.sub}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
