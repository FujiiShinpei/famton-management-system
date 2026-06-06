'use client'

import { useState } from 'react'
import { Order, OrderStatus, Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { updateOrderStatus, updatePaymentStatus, completeShipping } from "@/app/actions"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface OrderListProps {
    initialOrders: Order[]
    products: Product[]
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EditOrderDialog } from "./edit-order-dialog"
import { deleteOrder } from "@/app/actions"
import { Edit, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function OrderList({ initialOrders, products }: OrderListProps) {
    const [orders, setOrders] = useState<Order[]>(initialOrders)
    const [editingOrder, setEditingOrder] = useState<Order | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [shippingOrderId, setShippingOrderId] = useState<string | null>(null)
    const [advancedShippingCost, setAdvancedShippingCost] = useState<number | ''>('')

    async function confirmShipping() {
        if (!shippingOrderId) return
        const cost = Number(advancedShippingCost) || 0
        try {
            await completeShipping(shippingOrderId, cost)
            toast.success("発送完了として記録しました")
            setOrders(prev => prev.map(o => o.id === shippingOrderId ? { ...o, status: '発送済', advanced_shipping_cost: cost } : o))
        } catch (e) {
            console.error(e)
            toast.error("更新に失敗しました")
        } finally {
            setShippingOrderId(null)
            setAdvancedShippingCost('')
        }
    }

    async function handlePaymentStatusChange(id: string, newStatus: "未入金" | "入金済") {
        try {
            await updatePaymentStatus(id, newStatus)
            toast.success(`入金状況を「${newStatus}」に更新しました`)
            setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: newStatus } : o))
        } catch (e) {
            console.error(e)
            toast.error("更新に失敗しました")
        }
    }

    async function handleConfirmDelete() {
        if (!deletingId) return
        try {
            await deleteOrder(deletingId)
            toast.success("注文を削除しました")
            setOrders(prev => prev.filter(o => o.id !== deletingId))
        } catch (e) {
            console.error(e)
            toast.error("削除に失敗しました")
        } finally {
            setDeletingId(null)
        }
    }

    function openEdit(order: Order) {
        setEditingOrder(order)
        setIsEditOpen(true)
    }

    function handleEditSuccess(updatedOrder: Order) {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o))
    }

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

    const renderOrderCard = (order: Order) => {
        const product = products.find(p => p.id === order.product_id);
        return (
            <Card key={order.id} className="mb-4">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">{order.customer_name} 様</span>
                        <div className="flex gap-2">
                            {getPaymentBadge(order.payment_status)}
                            {getStatusBadge(order.status)}
                        </div>
                    </div>
                    <div className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div>
                </CardHeader>
                <CardContent className="pb-2 text-sm space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-gray-500">商品</div>
                        <div className="col-span-2 font-medium">{product ? product.name : order.product_id}</div>
                        <div className="text-gray-500">数量</div>
                        <div className="col-span-2 font-medium">{order.quantity}</div>
                    </div>

                    <div className="border-t pt-2 mt-2 space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="text-gray-500">受取</div>
                            <div className="col-span-2">{order.delivery_method}</div>
                        </div>
                        {order.delivery_method === '配送' && (
                            <>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-gray-500">住所</div>
                                    <div className="col-span-2">
                                        〒{order.postal_code}<br />
                                        {order.address}
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-gray-500">電話</div>
                                    <div className="col-span-2">{order.phone_number}</div>
                                </div>
                            </>
                        )}
                        {order.team_name && (
                            <div className="grid grid-cols-3 gap-2">
                                <div className="text-gray-500">チーム</div>
                                <div className="col-span-2">{order.team_name}</div>
                            </div>
                        )}
                        {order.remarks && (
                            <div className="grid grid-cols-3 gap-2">
                                <div className="text-gray-500">備考</div>
                                <div className="col-span-2 whitespace-pre-wrap text-gray-700">{order.remarks}</div>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex gap-2 flex-wrap">
                    {order.payment_status === '未入金' ? (
                        <Button variant="outline" className="flex-1 border-green-600 text-green-600 hover:bg-green-50 min-w-[100px]" onClick={() => handlePaymentStatusChange(order.id, '入金済')}>
                            入金確認
                        </Button>
                    ) : (
                        <Button variant="outline" className="flex-1 text-gray-500 min-w-[100px]" onClick={() => handlePaymentStatusChange(order.id, '未入金')}>
                            未入金に戻す
                        </Button>
                    )}
                    {order.status !== '発送済' && (
                        <Button className="flex-1 min-w-[100px]" onClick={() => setShippingOrderId(order.id)}>
                            発送完了
                        </Button>
                    )}
                    <Button variant="outline" size="icon" onClick={() => openEdit(order)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => setDeletingId(order.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    const renderOrderTable = (orderList: Order[]) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead>顧客名</TableHead>
                    <TableHead>商品(数量)</TableHead>
                    <TableHead>受取方法 / 住所等</TableHead>
                    <TableHead>その他</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead className="text-right">アクション</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orderList.map((order) => {
                    const product = products.find(p => p.id === order.product_id);
                    return (
                        <TableRow key={order.id} className="align-top">
                            <TableCell className="whitespace-nowrap">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium">
                                {order.customer_name}
                                {order.team_name && <div className="text-xs text-gray-500">{order.team_name}</div>}
                            </TableCell>
                            <TableCell>
                                {product ? product.name : order.product_id}
                                <span className="ml-1 font-bold">x {order.quantity}</span>
                            </TableCell>
                            <TableCell className="max-w-xs">
                                <div className="font-semibold">{order.delivery_method}</div>
                                {order.delivery_method === '配送' && (
                                    <div className="text-sm mt-1">
                                        <div>〒{order.postal_code}</div>
                                        <div>{order.address}</div>
                                        <div>{order.phone_number}</div>
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="max-w-xs whitespace-pre-wrap text-sm">
                                {order.remarks}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1 items-start">
                                    {getPaymentBadge(order.payment_status)}
                                    {getStatusBadge(order.status)}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2 flex-wrap">
                                    {order.payment_status === '未入金' ? (
                                        <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50" onClick={() => handlePaymentStatusChange(order.id, '入金済')}>
                                            入金確認
                                        </Button>
                                    ) : (
                                        <Button size="sm" variant="outline" className="text-gray-500" onClick={() => handlePaymentStatusChange(order.id, '未入金')}>
                                            未入金に戻す
                                        </Button>
                                    )}
                                    {order.status !== '発送済' && (
                                        <Button size="sm" onClick={() => setShippingOrderId(order.id)}>
                                            発送完了
                                        </Button>
                                    )}
                                    <Button size="icon" variant="ghost" onClick={() => openEdit(order)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeletingId(order.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )

    const unshippedList = orders.filter(o => o.status !== '発送済' && o.status !== 'キャンセル');
    const shippedList = orders.filter(o => o.status === '発送済' || o.status === 'キャンセル');

    return (
        <div>
            <Tabs defaultValue="unshipped">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="unshipped">未発送 ({unshippedList.length})</TabsTrigger>
                    <TabsTrigger value="shipped">発送済・キャンセル ({shippedList.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="unshipped">
                    {/* Mobile View */}
                    <div className="md:hidden">
                        {unshippedList.length === 0 ? <p className="text-center py-4 text-gray-500">未発送の注文はありません</p> : unshippedList.map(renderOrderCard)}
                    </div>
                    {/* Desktop View */}
                    <div className="hidden md:block rounded-md border">
                        {unshippedList.length === 0 ? <p className="text-center py-10 text-gray-500">未発送の注文はありません</p> : renderOrderTable(unshippedList)}
                    </div>
                </TabsContent>

                <TabsContent value="shipped">
                    {/* Mobile View */}
                    <div className="md:hidden">
                        {shippedList.length === 0 ? <p className="text-center py-4 text-gray-500">発送済・キャンセルの注文はありません</p> : shippedList.map(renderOrderCard)}
                    </div>
                    {/* Desktop View */}
                    <div className="hidden md:block rounded-md border">
                        {shippedList.length === 0 ? <p className="text-center py-10 text-gray-500">発送済・キャンセルの注文はありません</p> : renderOrderTable(shippedList)}
                    </div>
                </TabsContent>
            </Tabs>

            <EditOrderDialog
                order={editingOrder}
                products={products}
                isOpen={isEditOpen}
                onOpenChange={setIsEditOpen}
                onSuccess={handleEditSuccess}
            />

            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                            この操作は取り消せません。注文データが完全に削除されます。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleConfirmDelete}>削除する</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!shippingOrderId} onOpenChange={(open) => {
                if (!open) {
                    setShippingOrderId(null)
                    setAdvancedShippingCost('')
                }
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>発送完了の確認</AlertDialogTitle>
                        <AlertDialogDescription>
                            発送を完了します。送料の建て替えが発生した場合は、その金額を入力してください。（ない場合はそのまま確定してください）
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label htmlFor="shippingCost">建て替え送料 (円)</Label>
                        <Input 
                            id="shippingCost" 
                            type="number" 
                            min="0"
                            value={advancedShippingCost} 
                            onChange={(e) => setAdvancedShippingCost(e.target.value === '' ? '' : Number(e.target.value))}
                            className="mt-2"
                            placeholder="0"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setAdvancedShippingCost('')}>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmShipping}>確定して発送完了</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
