'use client'

import { useState } from 'react'
import { Expense } from "@/lib/types"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ExpenseBreakdownProps {
    expenses: Expense[]
    targetYear?: number
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#6b7280']

type RangeMode = 'month' | 'year' | 'all'

export function ExpenseBreakdown({ expenses, targetYear }: ExpenseBreakdownProps) {
    const [mode, setMode] = useState<RangeMode>('year')

    const now = new Date()
    const currentYear = now.getFullYear()
    const displayYear = targetYear || currentYear

    const filtered = expenses.filter(e => {
        if (!e.date) return false
        const d = new Date(e.date)
        if (isNaN(d.getTime())) return false
        
        if (mode === 'month') {
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
        }
        if (mode === 'year') {
            return d.getFullYear() === displayYear
        }
        return true
    })

    const byCategory = new Map<string, number>()
    filtered.forEach(e => {
        const cat = e.category || '未分類'
        byCategory.set(cat, (byCategory.get(cat) || 0) + (Number(e.amount) || 0))
    })

    const data = Array.from(byCategory.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

    const total = data.reduce((sum, d) => sum + d.value, 0)

    return (
        <Card className="w-full h-full">
            <CardHeader>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                        <CardTitle>経費カテゴリー内訳</CardTitle>
                        <CardDescription>
                            {mode === 'month' ? '今月' : mode === 'year' ? `${displayYear}年` : '全期間'} ・ 合計 ¥{total.toLocaleString()}
                        </CardDescription>
                    </div>
                    <div className="flex gap-1">
                        <Button size="sm" variant={mode === 'month' ? 'default' : 'outline'} onClick={() => setMode('month')}>今月</Button>
                        <Button size="sm" variant={mode === 'year' ? 'default' : 'outline'} onClick={() => setMode('year')}>{displayYear}年</Button>
                        <Button size="sm" variant={mode === 'all' ? 'default' : 'outline'} onClick={() => setMode('all')}>全期間</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">対象期間に経費データはありません</p>
                ) : (
                    <div style={{ width: '100%', height: 280 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={90}
                                    dataKey="value"
                                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {data.map((_, idx) => (
                                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={((value: any) => `¥${Number(value).toLocaleString()}`) as any} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
