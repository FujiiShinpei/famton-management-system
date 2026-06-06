'use client'

interface ReceiptViewProps {
    receiptName: string
    totalAmount: number
    productName: string
    quantity: number
    productAmount: number
    shippingCost: number
    deliveryMethod: '配送' | 'その他'
    note: string
    receiptNumber: string
    issuer: { name: string; address: string; tel: string }
}

export function ReceiptView({
    receiptName,
    totalAmount,
    productName,
    quantity,
    productAmount,
    shippingCost,
    deliveryMethod,
    note,
    receiptNumber,
    issuer,
}: ReceiptViewProps) {
    const issueDate = new Date()
    const dateStr = `${issueDate.getFullYear()}年${issueDate.getMonth() + 1}月${issueDate.getDate()}日`
    const yen = (n: number) => `¥${n.toLocaleString()}`

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 print:bg-white print:p-0">
            {/* 操作ボタン（印刷時は非表示） */}
            <div className="max-w-2xl mx-auto mb-4 flex justify-end gap-2 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="rounded-md bg-slate-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-slate-700"
                >
                    PDFとして保存 / 印刷する
                </button>
            </div>

            <p className="max-w-2xl mx-auto mb-4 text-xs text-gray-500 print:hidden">
                「PDFとして保存」ボタンを押し、送信先（出力先）で「PDFに保存」を選択すると、領収書をダウンロードできます。
            </p>

            {/* 領収書本体 */}
            <div className="max-w-2xl mx-auto bg-white border border-gray-300 p-10 print:border-0 print:max-w-full">
                <h1 className="text-center text-3xl font-bold tracking-[0.3em] mb-8">領 収 書</h1>

                <div className="flex justify-between items-start mb-8 text-sm">
                    <span className="text-gray-600">No. {receiptNumber}</span>
                    <span className="text-gray-600">発行日: {dateStr}</span>
                </div>

                {/* 宛名 */}
                <div className="mb-8">
                    <div className="text-2xl font-semibold border-b border-gray-400 pb-2 inline-block min-w-[60%]">
                        {receiptName} <span className="text-base font-normal">様</span>
                    </div>
                </div>

                {/* 金額 */}
                <div className="mb-8 border-2 border-gray-800 rounded">
                    <div className="flex items-center">
                        <div className="bg-gray-100 px-6 py-4 text-lg font-medium border-r border-gray-800">
                            金額
                        </div>
                        <div className="flex-1 text-right px-6 py-4 text-3xl font-bold">
                            {yen(totalAmount)}<span className="text-base font-normal ml-1">-</span>
                        </div>
                    </div>
                </div>

                {/* 但し書き */}
                <div className="mb-8 text-base">
                    <span className="text-gray-600">但し </span>
                    <span className="border-b border-gray-400 pb-0.5">{note}</span>
                </div>

                <p className="mb-8 text-sm text-gray-700">
                    上記正に領収いたしました。
                </p>

                {/* 内訳 */}
                <div className="mb-10 text-sm">
                    <div className="font-medium mb-2">【内訳】</div>
                    <table className="w-full border-collapse">
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-2">{productName}（数量: {quantity}）</td>
                                <td className="py-2 text-right">{yen(productAmount)}</td>
                            </tr>
                            {deliveryMethod === '配送' && (
                                <tr className="border-b border-gray-200">
                                    <td className="py-2">送料</td>
                                    <td className="py-2 text-right">{yen(shippingCost)}</td>
                                </tr>
                            )}
                            <tr className="font-bold">
                                <td className="py-2">合計</td>
                                <td className="py-2 text-right">{yen(totalAmount)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 発行者 */}
                <div className="flex justify-end">
                    <div className="text-sm text-right leading-relaxed">
                        <div className="text-base font-semibold">{issuer.name}</div>
                        {issuer.address && <div>{issuer.address}</div>}
                        {issuer.tel && <div>TEL: {issuer.tel}</div>}
                    </div>
                </div>
            </div>
        </div>
    )
}
