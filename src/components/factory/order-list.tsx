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
import { Edit, Trash2, Loader2, ChevronDown } from "lucide-react"
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
    const [isProcessing, setIsProcessing] = useState(false)
    const [processingMessage, setProcessingMessage] = useState("処理中...")
    const [showCompleted, setShowCompleted] = useState(false)

    async function confirmShipping() {
        if (!shippingOrderId || isProcessing) return
        const cost = Number(advancedShippingCost) || 0
        setProcessingMessage("発送完了を記録しています...")
        setIsProcessing(true)
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
            setIsProcessing(false)
        }
    }

    async function handlePaymentStatusChange(id: string, newStatus: "未入金" | "入金済") {
        if (isProcessing) return
        setProcessingMessage(newStatus === '入金済' ? "入金確認を記録しています..." : "入金状況を更新しています...")
        setIsProcessing(true)
        try {
            await updatePaymentStatus(id, newStatus)
            toast.success(`入金状況を「${newStatus}」に更新しました`)
            setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: newStatus } : o))
        } catch (e) {
            console.error(e)
            toast.error("更新に失敗しました")
        } finally {
            setIsProcessing(false)
        }
    }

    async function handleConfirmDelete() {
        if (!deletingId || isProcessing) return
        setProcessingMessage("注文を削除しています...")
        setIsProcessing(true)
        try {
            await deleteOrder(deletingId)
            toast.success("注文を削除しました")
            setOrders(prev => prev.filter(o => o.id !== deletingId))
        } catch (e) {
            console.error(e)
            toast.error("削除に失敗しました")
        } finally {
            setDeletingId(null)
            setIsProcessing(false)
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

    // 領収書区分を判定。過去データ・代理注文（is_proxy が false 以外）は表示しない。
    // receipt_type が無い旧データは receipt_required から電子/無しに読み替える。
    const getReceiptType = (order: Order): "電子" | "紙" | "無し" | null => {
        if (order.is_proxy !== false) return null
        return order.receipt_type ?? (order.receipt_required ? "電子" : "無し")
    }

    // 注文経路（代理注文 / Web注文）のバッジ。過去データ（is_proxy が未設定）は表示しない
    const getSourceBadge = (order: Order) => {
        if (order.is_proxy === true) {
            return <Badge className="bg-orange-500 hover:bg-orange-600">代理注文</Badge>
        }
        if (order.is_proxy === false) {
            return <Badge className="bg-sky-600 hover:bg-sky-700">Web注文</Badge>
        }
        return null
    }

    const renderOrderCard = (order: Order) => {
        const product = products.find(p => p.id === order.product_id);
        return (
            <Card key={order.id} className="mb-4">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">{order.customer_name} 様</span>
                        <div className="flex gap-2 flex-wrap justify-end">
                            {getSourceBadge(order)}
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
                                        {order.prefecture}{order.address}
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
                        {(() => {
                            const t = getReceiptType(order)
                            if (!t) return null
                            const text = t === "電子" ? "電子で送付" : t === "紙" ? "紙で発行（別途連絡）" : "希望無し"
                            const cls = t === "紙" ? "font-medium text-red-600" : t === "電子" ? "font-medium text-blue-600" : "text-gray-500"
                            return (
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-gray-500">領収書</div>
                                    <div className={`col-span-2 ${cls}`}>
                                        {text}
                                    </div>
                                </div>
                            )
                        })()}
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
                                        <div>{order.prefecture}{order.address}</div>
                                        <div>{order.phone_number}</div>
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="max-w-xs whitespace-pre-wrap text-sm">
                                {(() => {
                                    const t = getReceiptType(order)
                                    if (!t) return null
                                    const text = t === "電子" ? "領収書：電子で送付" : t === "紙" ? "領収書：紙で発行（別途連絡）" : "領収書希望無し"
                                    const cls = t === "紙" ? "font-medium text-red-600" : t === "電子" ? "font-medium text-blue-600" : "text-gray-500"
                                    return (
                                        <div className={cls}>
                                            {text}
                                        </div>
                                    )
                                })()}
                                {order.remarks && <div className="mt-1">{order.remarks}</div>}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1 items-start">
                                    {getSourceBadge(order)}
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

    // 新しい順（作成日の降順）
    const sortByNewest = (list: Order[]) =>
        [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // 完了済み（入金済 かつ 発送済）は折りたたむ。それ以外（発送済だが未入金・キャンセル）は通常表示。
    const completedList = sortByNewest(
        shippedList.filter(o => o.payment_status === '入金済' && o.status === '発送済')
    );
    const activeShippedList = sortByNewest(
        shippedList.filter(o => !(o.payment_status === '入金済' && o.status === '発送済'))
    );

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
                    {shippedList.length === 0 ? (
                        <p className="text-center py-10 text-gray-500">発送済・キャンセルの注文はありません</p>
                    ) : (
                        <>
                            {/* 対応が残っているもの（発送済だが未入金・キャンセル） */}
                            {/* Mobile View */}
                            <div className="md:hidden">
                                {activeShippedList.length === 0
                                    ? <p className="text-center py-4 text-gray-500">対応中の注文はありません</p>
                                    : activeShippedList.map(renderOrderCard)}
                            </div>
                            {/* Desktop View */}
                            <div className="hidden md:block rounded-md border">
                                {activeShippedList.length === 0
                                    ? <p className="text-center py-10 text-gray-500">対応中の注文はありません</p>
                                    : renderOrderTable(activeShippedList)}
                            </div>

                            {/* 完了済み（入金済・発送済）の折りたたみ */}
                            {completedList.length > 0 && (
                                <div className="mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCompleted(v => !v)}
                                        className="flex w-full items-center justify-between rounded-md border bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                                    >
                                        <span>完了した注文（入金済・発送済） {completedList.length}件</span>
                                        <ChevronDown className={`h-4 w-4 transition-transform ${showCompleted ? 'rotate-180' : ''}`} />
                                    </button>

                                    {showCompleted && (
                                        <div className="mt-4">
                                            {/* Mobile View */}
                                            <div className="md:hidden">
                                                {completedList.map(renderOrderCard)}
                                            </div>
                                            {/* Desktop View */}
                                            <div className="hidden md:block rounded-md border">
                                                {renderOrderTable(completedList)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
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

            {/* 処理中オーバーレイ（連続クリック防止のため画面をロック） */}
            {isProcessing && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    role="alertdialog"
                    aria-busy="true"
                    aria-label={processingMessage}
                >
                    <div className="flex flex-col items-center gap-4 rounded-lg bg-white px-8 py-6 shadow-xl">
                        <Loader2 className="h-10 w-10 animate-spin text-slate-700" />
                        <p className="text-sm font-medium text-slate-700">{processingMessage}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
