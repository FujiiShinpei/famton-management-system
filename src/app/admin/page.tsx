import { getOrders, getProducts, getExpenses } from "@/app/actions";
import { PayrollSummary } from "@/components/admin/payroll-summary";
import { SalesChart } from "@/components/admin/sales-chart";
import { AdminOrderList } from "@/components/admin/admin-order-list";
import { DashboardMenu } from "@/components/admin/dashboard-menu";
import { KpiCards } from "@/components/admin/kpi-cards";
import { ExpenseBreakdown } from "@/components/admin/expense-breakdown";
import { YearSelector } from "@/components/admin/year-selector";
import { ReceiptJapaneseYen } from "lucide-react";

export default async function AdminPage({
    searchParams
}: {
    searchParams?: { year?: string }
}) {
    const orders = await getOrders();
    const products = await getProducts();
    const expenses = await getExpenses();

    const menuItems = [
        {
            title: "経費管理",
            href: "/expenses",
            description: "経費データの登録・編集・閲覧",
            icon: <ReceiptJapaneseYen className="h-5 w-5 text-primary" />
        }
    ];

    const now = new Date();
    const currentYear = now.getFullYear();
    // @ts-ignore - Next.js 15 requires awaiting searchParams, but 14 doesn't. Safe fallback.
    const resolvedSearchParams = await Promise.resolve(searchParams);
    const targetYear = resolvedSearchParams?.year ? parseInt(resolvedSearchParams.year, 10) : currentYear;

    return (
        <div className="container mx-auto py-8 px-4 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">経営ダッシュボード (Admin)</h1>
                <YearSelector currentYear={currentYear} />
            </div>

            {/* Navigation Menu */}
            <DashboardMenu items={menuItems} />

            {/* KPI Cards */}
            <KpiCards orders={orders} expenses={expenses} targetYear={targetYear} />

            {/* Line Chart - Full width */}
            <SalesChart orders={orders} expenses={expenses} targetYear={targetYear} />

            {/* Payroll & Expense Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PayrollSummary orders={orders} products={products} expenses={expenses} />
                <ExpenseBreakdown expenses={expenses} targetYear={targetYear} />
            </div>

            <div>
                <h2 className="text-xl font-bold mb-4">注文履歴</h2>
                <AdminOrderList orders={orders} />
            </div>
        </div>
    );
}
