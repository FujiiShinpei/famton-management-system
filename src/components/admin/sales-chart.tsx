'use client'

import { useState } from 'react'
import { Order, Expense } from "@/lib/types"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SalesChartProps {
    orders: Order[]
    expenses: Expense[]
    targetYear?: number
}

type RangeMode = 'year' | 'all'

export function SalesChart({ orders, expenses, targetYear }: SalesChartProps) {
    const [mode, setMode] = useState<RangeMode>('year')

    const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

    const now = new Date()
    const currentYear = now.getFullYear()
    const displayYear = targetYear || currentYear

    const data = (() => {
        const map = new Map<string, { month: string; sales: number; expenses: number; profit: number }>()

        if (mode === 'year') {
            // 対象年の12ヶ月分（1月〜12月）を0埋めで生成
            for (let i = 0; i < 12; i++) {
                const d = new Date(displayYear, i, 1)
                const key = monthKey(d)
                map.set(key, { month: key, sales: 0, expenses: 0, profit: 0 })
            }
        }

        const ensureMonth = (key: string) => {
            if (!map.has(key)) {
                map.set(key, { month: key, sales: 0, expenses: 0, profit: 0 })
            }
            return map.get(key)!
        }

        orders.forEach(order => {
            if (order.status === 'キャンセル') return
            const d = new Date(order.created_at)
            if (isNaN(d.getTime())) return
            const key = monthKey(d)
            if (mode === 'year' && !map.has(key)) return // 対象年外
            ensureMonth(key).sales += order.amount || 0
        })

        expenses.forEach(expense => {
            if (!expense.date) return
            const d = new Date(expense.date)
            if (isNaN(d.getTime())) return
            const key = monthKey(d)
            if (mode === 'year' && !map.has(key)) return
            ensureMonth(key).expenses += Number(expense.amount) || 0
        })

        return Array.from(map.values())
            .map(item => ({ ...item, profit: item.sales - item.expenses }))
            .sort((a, b) => a.month.localeCompare(b.month))
    })()

    const totalSales = data.reduce((s, d) => s + d.sales, 0)
    const totalProfit = data.reduce((s, d) => s + d.profit, 0)

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                        <CardTitle>損益推移</CardTitle>
                        <CardDescription>
                            {mode === 'year' ? `${displayYear}年` : '全期間'} ・ 売上合計 ¥{totalSales.toLocaleString()} / 利益 ¥{totalProfit.toLocaleString()}
                        </CardDescription>
                    </div>
                    <div className="flex gap-1">
                        <Button
                            size="sm"
                            variant={mode === 'year' ? 'default' : 'outline'}
                            onClick={() => setMode('year')}
                        >
                            {displayYear}年
                        </Button>
                        <Button
                            size="sm"
                            variant={mode === 'all' ? 'default' : 'outline'}
                            onClick={() => setMode('all')}
                        >
                            全期間
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer>
                        <LineChart
                            data={data}
                            margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={(v) => `¥${(v / 1000).toLocaleString()}k`}
                            />
                            <Tooltip
                                formatter={((value: any) => `¥${Number(value).toLocaleString()}`) as any}
                                labelFormatter={(label) => `${label}`}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="sales" name="売上" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="expenses" name="経費" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="profit" name="利益" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
