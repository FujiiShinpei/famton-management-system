import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SuccessPage({ searchParams }: Props) {
  const params = await searchParams
  const amount = params.amount ? parseInt(params.amount as string) : 0

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-md space-y-6 mt-10">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">注文完了</h1>
          <p className="mt-2 text-sm text-gray-600">
            ご注文ありがとうございます。<br/>内容を受け付けました。
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>お振込みのご案内</CardTitle>
            <CardDescription>
              以下の指定口座へ、<strong>{amount.toLocaleString()}円</strong>のお振込みをお願いいたします。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-md border text-sm space-y-2">
              <div className="flex justify-between border-b pb-2 border-slate-200">
                <span className="text-gray-500">銀行名</span>
                <span className="font-semibold">三井住友銀行</span>
              </div>
              <div className="flex justify-between border-b pb-2 border-slate-200">
                <span className="text-gray-500">支店名</span>
                <span className="font-semibold">西宮支店 (370)</span>
              </div>
              <div className="flex justify-between border-b pb-2 border-slate-200">
                <span className="text-gray-500">口座種別</span>
                <span className="font-semibold">普通</span>
              </div>
              <div className="flex justify-between border-b pb-2 border-slate-200">
                <span className="text-gray-500">口座番号</span>
                <span className="font-semibold">8970299</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">口座名義</span>
                <span className="font-semibold">ﾌｼﾞｲｼﾞﾑｼｮ ﾌｼﾞｲｼﾝﾍﾟｲ</span>
              </div>
            </div>
            
            <div className="text-xs text-red-500 bg-red-50 p-3 rounded-md">
              ※ 恐れ入りますが、振込手数料はお客様にてご負担をお願いいたします。<br/>
              ※ ご入金が確認でき次第、商品の受け渡し準備を進めさせていただきます。
            </div>

          </CardContent>
        </Card>

        <div className="text-center">
          <Button asChild className="w-full">
            <Link href="/">
              注文ページへ戻る
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
