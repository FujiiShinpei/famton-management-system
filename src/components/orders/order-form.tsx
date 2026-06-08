'use client'

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
import { submitOrder } from '@/app/actions'
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
    receipt_choice: z.enum(["希望する", "希望しない"]),
    receipt_name: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.receipt_choice === "希望する" && !data.receipt_name) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "領収書をご希望の場合は宛名を入力してください",
            path: ["receipt_name"],
        });
    }
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

interface OrderFormProps {
    products: Product[]
}

export function OrderForm({ products }: OrderFormProps) {
    const router = useRouter()
    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            customer_name: "",
            email: "",
            product_id: "",
            quantity: 1,
            delivery_method: "配送",
            postal_code: "",
            prefecture: "",
            address: "",
            phone_number: "",
            team_name: "",
            remarks: "",
            receipt_choice: "希望しない",
            receipt_name: "",
        },
    })

    // Calculate estimated price
    const watchProductId = form.watch("product_id")
    const watchQuantity = form.watch("quantity")
    const watchDeliveryMethod = form.watch("delivery_method")
    const watchPrefecture = form.watch("prefecture")
    const watchReceiptChoice = form.watch("receipt_choice")

    const selectedProduct = products.find(p => p.id === watchProductId)
    const productAmount = selectedProduct && watchQuantity ? selectedProduct.price * watchQuantity : 0
    const shippingCost = watchDeliveryMethod === "配送" && watchPrefecture
        ? calculateShippingCost(watchPrefecture, Number(watchQuantity) || 1)
        : 0
    const estimatedAmount = productAmount + shippingCost

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await submitOrder({
                ...values,
                shipping_cost: shippingCost,
                receipt_required: values.receipt_choice === "希望する",
                receipt_name: values.receipt_choice === "希望する" ? values.receipt_name : undefined,
            })
            toast.success("注文を受け付けました！")
            router.push(`/success?amount=${estimatedAmount}`)
        } catch (error) {
            console.error(error)
            toast.error("注文の送信に失敗しました")
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto mt-10 mb-10">
            <CardHeader>
                <CardTitle>注文フォーム</CardTitle>
                <CardDescription>ファミリーバドミントン用品のご注文はこちらから</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="product_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>商品 <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="商品を選択" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {products.filter(p => p.is_active && !p.factory_only).map((product) => (
                                                <SelectItem key={product.id} value={product.id}>
                                                    {product.name} (¥{product.price.toLocaleString()})
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
                                    <FormLabel>数量 <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="number" min={1} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                        <Input type="email" placeholder="example@gmail.com" {...field} />
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
                                    <FormLabel>受取方法</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="配送" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    配送希望
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
                                                <Input placeholder="123-4567" {...field} />
                                            </FormControl>
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
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                        <FormField
                            control={form.control}
                            name="receipt_choice"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>領収書の発行</FormLabel>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        領収書は<span className="font-medium">電子領収書（PDF）</span>での発行となります。<br />
                                        入金確認後にダウンロードURLをメールでお送りしますので、お客様ご自身でダウンロード・印刷していただけます。<br />
                                        ※紙の領収書の郵送は行っておりません。
                                    </p>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="希望しない" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    不要
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="希望する" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    希望する
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {watchReceiptChoice === "希望する" && (
                            <div className="pl-4 border-l-2 border-slate-200 mt-4 space-y-4">
                                <FormField
                                    control={form.control}
                                    name="receipt_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>領収書の宛名 <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="〇〇株式会社 / 山田 太郎" {...field} />
                                            </FormControl>
                                            <p className="text-xs text-gray-500">入金確認後、領収書のダウンロードURLをメールでご案内します。</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

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
                            {form.formState.isSubmitting ? "送信中..." : "注文を確定する"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
