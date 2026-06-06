import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExpenseForm } from "@/components/expenses/expense-form"
import { ExpenseList } from "@/components/expenses/expense-list"
import { getExpenses } from "@/app/actions"

export default async function ExpensesPage() {
    const expenses = await getExpenses()

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <Button variant="ghost" asChild>
                    <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        ダッシュボードに戻る
                    </Link>
                </Button>
            </div>
            <h1 className="text-2xl font-bold mb-6 text-center">経費管理</h1>

            <div className="grid gap-8">
                <ExpenseForm />
                <div className="border-t pt-8">
                    <ExpenseList expenses={expenses} />
                </div>
            </div>
        </div>
    )
}
