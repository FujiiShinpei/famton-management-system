"use client"

import { Expense } from "@/lib/types"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ExpenseListProps {
    expenses: Expense[]
}

export function ExpenseList({ expenses }: ExpenseListProps) {
    const sortedExpenses = [...expenses].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return (
        <Card className="w-full max-w-4xl mx-auto mt-8">
            <CardHeader>
                <CardTitle>経費履歴</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">日付</TableHead>
                            <TableHead className="w-[120px]">カテゴリー</TableHead>
                            <TableHead>詳細</TableHead>
                            <TableHead className="w-[100px]">種別</TableHead>
                            <TableHead className="text-right">金額</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedExpenses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                    登録された経費はありません
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedExpenses.map((expense) => (
                                <TableRow key={expense.id}>
                                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{expense.category}</TableCell>
                                    <TableCell>{expense.description}</TableCell>
                                    <TableCell>
                                        {expense.is_advance ? (
                                            expense.is_advance_paid
                                                ? <Badge className="bg-gray-400 hover:bg-gray-500 text-xs">立替・精算済</Badge>
                                                : <Badge variant="destructive" className="text-xs">立替・未精算</Badge>
                                        ) : null}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        ¥{expense.amount.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
