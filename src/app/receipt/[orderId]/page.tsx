import { googleSheetsService } from '@/lib/google-sheets'
import { ReceiptView } from '@/components/receipt/receipt-view'

export const dynamic = 'force-dynamic'

interface ReceiptPageProps {
    params: Promise<{ orderId: string }>
}

// 発行者情報（環境変数で上書き可能）
const ISSUER = {
    name: process.env.RECEIPT_ISSUER_NAME || 'Famton',
    address: process.env.RECEIPT_ISSUER_ADDRESS || '兵庫県尼崎市大庄西町1-11-5 102',
    tel: process.env.RECEIPT_ISSUER_TEL || '',
}
const DEFAULT_NOTE = process.env.RECEIPT_DEFAULT_NOTE || 'ファミリーバドミントン用品代として'

export default async function ReceiptPage({ params }: ReceiptPageProps) {
    const { orderId } = await params

    const [orders, products] = await Promise.all([
        googleSheetsService.getOrders(),
        googleSheetsService.getProducts(),
    ])

    const order = orders.find(o => o.id === orderId)

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 text-center">
                <div>
                    <h1 className="text-xl font-bold mb-2">領収書が見つかりません</h1>
                    <p className="text-gray-500 text-sm">URLをご確認いただくか、発行元までお問い合わせください。</p>
                </div>
            </div>
        )
    }

    if (order.payment_status !== '入金済') {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 text-center">
                <div>
                    <h1 className="text-xl font-bold mb-2">領収書はまだ発行できません</h1>
                    <p className="text-gray-500 text-sm">
                        ご入金の確認後に発行が可能となります。<br />
                        恐れ入りますが、入金確認のご連絡をお待ちください。
                    </p>
                </div>
            </div>
        )
    }

    const product = products.find(p => p.id === order.product_id)
    const productAmount = Number(order.amount) || 0
    const shippingCost = Number(order.shipping_cost) || 0
    const totalAmount = productAmount + shippingCost

    return (
        <ReceiptView
            receiptName={order.receipt_name || order.customer_name}
            totalAmount={totalAmount}
            productName={product?.name || '商品'}
            quantity={order.quantity}
            productAmount={productAmount}
            shippingCost={shippingCost}
            deliveryMethod={order.delivery_method}
            note={DEFAULT_NOTE}
            receiptNumber={order.id}
            issuer={ISSUER}
        />
    )
}
