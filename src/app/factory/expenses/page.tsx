import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdvanceExpenseForm } from "@/components/expenses/advance-expense-form";
import { getExpenses } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function FactoryAdvanceExpensePage() {
    const expenses = await getExpenses();
    const advances = expenses
        .filter(e => e.is_advance)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="container mx-auto py-8 px-4 space-y-8">
            <div className="mb-2">
                <Button variant="ghost" asChild>
                    <Link href="/factory" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        工場メニューに戻る
                    </Link>
                </Button>
            </div>

            <h1 className="text-2xl font-bold">立替金登録</h1>

            <AdvanceExpenseForm />

            <div className="border-t pt-6">
                <h2 className="text-lg font-semibold mb-4">立替金履歴 ({advances.length}件)</h2>
                {advances.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">登録された立替金はありません</p>
                ) : (
                    <div className="space-y-3">
                        {advances.map(expense => (
                            <Card key={expense.id}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span>{expense.category}</span>
                                            {expense.is_advance_paid ? (
                                                <Badge className="bg-gray-400 hover:bg-gray-500 text-xs">精算済</Badge>
                                            ) : (
                                                <Badge variant="destructive" className="text-xs">未精算</Badge>
                                            )}
                                        </div>
                                        <span className="font-bold text-base">¥{expense.amount.toLocaleString()}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground space-y-1">
                                    <p>{expense.description}</p>
                                    <p className="text-xs text-gray-400">{new Date(expense.date).toLocaleDateString('ja-JP')}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
