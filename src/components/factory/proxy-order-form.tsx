"use client"

import { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Product } from "@/lib/types"
import { PREFECTURES, calculateShippingCost } from "@/lib/shipping-rates"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { submitProxyOrder } from '@/app/actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
    customer_name: z.string().min(1, "お名前を入力してください"),
    email: z.string().email("有効なメールアドレスを入力してください"),
    product_id: z.string().min(1, "商品を選択してください"),
    quantity: z.coerce.number().min(1, "1以上の数量を入力してください"),
    delivery_method: z.enum(["配送", "その他"]),
    postal_code: z.string().optional(),
    prefecture: z.string().optional(),
    address: z.string().optional(),
    phone_number: z.string().optional(),
    team_name: z.string().optional(),
    remarks: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.delivery_method === "配送") {
        if (!data.postal_code) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "配送の場合は郵便番号が必須です",
                path: ["postal_code"],
            });
        }
        if (!data.address) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "配送の場合は住所が必須です",
                path: ["address"],
            });
        }
        if (!data.phone_number) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "配送の場合は電話番号が必須です",
                path: ["phone_number"],
            });
        }
    }
});

interface ProxyOrderFormProps {
    products: Product[]
}

export function ProxyOrderForm({ products }: ProxyOrderFormProps) {
    const router = useRouter()
    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            customer_name: "",
            email: "",
            product_id: "",
            quantity: 1,
            delivery_method: "その他",
            postal_code: "",
            prefecture: "",
            address: "",
            phone_number: "",
            team_name: "",
            remarks: "",
        },
    })

    // Calculate estimated price
    const watchProductId = form.watch("product_id")
    const watchQuantity = form.watch("quantity")
    const watchDeliveryMethod = form.watch("delivery_method")
    const watchPrefecture = form.watch("prefecture")

    const [isLookingUpZip, setIsLookingUpZip] = useState(false)

    // 郵便番号から住所を自動取得（zipcloud API・APIキー不要）
    async function lookupAddress(rawZip: string) {
        const zip = rawZip.replace(/[^0-9]/g, "")
        if (zip.length !== 7) return
        setIsLookingUpZip(true)
        try {
            const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zip}`)
            const data = await res.json()
            if (data.status === 200 && data.results && data.results.length > 0) {
                const result = data.results[0]
                form.setValue("prefecture", result.address1, { shouldValidate: true })
                form.setValue("address", `${result.address2}${result.address3}`, { shouldValidate: true })
            } else {
                toast.error("該当する住所が見つかりませんでした。郵便番号をご確認ください。")
            }
        } catch (e) {
            console.error(e)
            toast.error("住所の取得に失敗しました。お手数ですが手入力してください。")
        } finally {
            setIsLookingUpZip(false)
        }
    }

    const selectedProduct = products.find(p => p.id === watchProductId)
    const productAmount = selectedProduct && watchQuantity ? selectedProduct.price * watchQuantity : 0
    const shippingCost = watchDeliveryMethod === "配送" && watchPrefecture
        ? calculateShippingCost(watchPrefecture, Number(watchQuantity) || 1)
        : 0
    const estimatedAmount = productAmount + shippingCost

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await submitProxyOrder({
                ...values,
                shipping_cost: shippingCost,
            })
            toast.success("注文を登録しました（メール送信はスキップされました）")
            form.reset({
                customer_name: "",
                email: "",
                product_id: "",
                quantity: 1,
                delivery_method: "その他",
                postal_code: "",
                prefecture: "",
                address: "",
                phone_number: "",
                team_name: "",
                remarks: "",
            })
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("注文の登録に失敗しました")
        }
    }

    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle>注文代理入力フォーム</CardTitle>
                <CardDescription>
                    工場スタッフがお客様の代わりに注文を登録します。（※お客様宛の確認メールは送信されません）
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="customer_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>お名前 <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="山田 太郎" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>メールアドレス <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="yamada@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="product_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>商品 <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="商品を選択してください" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {products.filter(p => p.is_active).map((product) => (
                                                <SelectItem key={product.id} value={product.id}>
                                                    {product.name} (¥{product.price.toLocaleString()}) {product.factory_only ? "【工場専用】" : ""}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>数量 (ダース) <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="number" min={1} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="delivery_method"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>受取方法 <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="配送" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    配送
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="その他" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    その他 (手渡し等)
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {watchDeliveryMethod === "配送" && (
                            <div className="pl-4 border-l-2 border-slate-200 mt-4 space-y-4">
                                <FormField
                                    control={form.control}
                                    name="postal_code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>郵便番号 <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="123-4567"
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e)
                                                        lookupAddress(e.target.value)
                                                    }}
                                                    onBlur={(e) => {
                                                        field.onBlur()
                                                        lookupAddress(e.target.value)
                                                    }}
                                                />
                                            </FormControl>
                                            <p className="text-xs text-gray-500">
                                                {isLookingUpZip
                                                    ? "住所を検索中..."
                                                    : "郵便番号（7桁）を入力すると都道府県・住所が自動入力されます"}
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="prefecture"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>都道府県 <span className="text-red-500">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="都道府県を選択" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {PREFECTURES.map((pref) => (
                                                        <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>住所 <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="東京都..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>電話番号 <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="090-1234-5678" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="team_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>チーム名・団体名 (任意)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="〇〇バドミントンクラブ" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="remarks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>その他何かあれば (任意)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="ご質問やご要望" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="rounded-lg bg-slate-50 p-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">商品代金</span>
                                <span>¥{productAmount.toLocaleString()}</span>
                            </div>
                            {watchDeliveryMethod === "配送" && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        送料
                                        {watchPrefecture && <span className="text-xs ml-1 text-slate-400">({watchPrefecture})</span>}
                                    </span>
                                    <span>
                                        {shippingCost > 0
                                            ? `¥${shippingCost.toLocaleString()}`
                                            : <span className="text-gray-400">都道府県を選択してください</span>
                                        }
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-base border-t pt-2">
                                <span>合計（見積もり）</span>
                                <span>¥{estimatedAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "送信中..." : "注文を代理登録する"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
