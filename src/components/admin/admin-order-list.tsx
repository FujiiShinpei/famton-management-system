import { Order, OrderStatus } from "@/lib/types"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface AdminOrderListProps {
    orders: Order[]
}

export function AdminOrderList({ orders }: AdminOrderListProps) {
    const sortedOrders = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const getStatusBadge = (status: OrderStatus) => {
        switch (status) {
            case '未対応': return <Badge variant="secondary">未対応</Badge>
            case '製造中': return <Badge variant="default" className="bg-yellow-500">製造中</Badge>
            case '発送済': return <Badge className="bg-gray-400 hover:bg-gray-500">発送済</Badge>
            case 'キャンセル': return <Badge variant="destructive">キャンセル</Badge>
            default: return <Badge>{status}</Badge>
        }
    }

    const getPaymentBadge = (status: "未入金" | "入金済") => {
        if (status === '入金済') {
            return <Badge className="bg-green-600 hover:bg-green-700">入金済</Badge>
        }
        return <Badge variant="destructive">未入金</Badge>
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>日付</TableHead>
                        <TableHead>顧客名</TableHead>
                        <TableHead>商品</TableHead>
                        <TableHead>数量</TableHead>
                        <TableHead>金額</TableHead>
                        <TableHead>ステータス</TableHead>
                        <TableHead>入金</TableHead>
                        <TableHead>給与支払</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedOrders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>{order.customer_name}</TableCell>
                            <TableCell>{order.product_id}</TableCell>
                            <TableCell>{order.quantity}</TableCell>
                            <TableCell>¥{order.amount.toLocaleString()}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell>{getPaymentBadge(order.payment_status)}</TableCell>
                            <TableCell>
                                {order.is_paid_to_worker ? (
                                    <Badge variant="default" className="bg-green-600">支払済</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-gray-400">未払</Badge>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
