'use client'

import { useState } from 'react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Order, Product, OrderStatus } from "@/lib/types"
import { updateOrder } from "@/app/actions"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
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
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const formSchema = z.object({
    status: z.enum(["未対応", "製造中", "発送済", "キャンセル"]),
    customer_name: z.string().min(1, "お名前を入力してください"),
    product_id: z.string().min(1, "商品を選択してください"),
    quantity: z.coerce.number().min(1, "1以上の数量を入力してください"),
    delivery_method: z.enum(["配送", "その他"]),
    postal_code: z.string().optional(),
    address: z.string().optional(),
    phone_number: z.string().optional(),
    team_name: z.string().optional(),
    remarks: z.string().optional(),
})

interface EditOrderDialogProps {
    order: Order | null
    products: Product[]
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: (updatedOrder: Order) => void
}

export function EditOrderDialog({ order, products, isOpen, onOpenChange, onSuccess }: EditOrderDialogProps) {
    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: "未対応",
            customer_name: "",
            product_id: "",
            quantity: 1,
            delivery_method: "その他",
            postal_code: "",
            address: "",
            phone_number: "",
            team_name: "",
            remarks: "",
        },
        values: order ? {
            status: order.status,
            customer_name: order.customer_name,
            product_id: order.product_id,
            quantity: order.quantity,
            delivery_method: order.delivery_method,
            postal_code: order.postal_code || "",
            address: order.address || "",
            phone_number: order.phone_number || "",
            team_name: order.team_name || "",
            remarks: order.remarks || "",
        } : undefined
    })

    const watchDeliveryMethod = form.watch("delivery_method")

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!order) return

        try {
            // Recalculate amount if product or quantity changed
            const product = products.find(p => p.id === values.product_id)
            const amount = product ? product.price * values.quantity : order.amount

            const updates = {
                ...values,
                amount,
            }

            await updateOrder(order.id, updates)
            toast.success("注文情報を更新しました")
            onSuccess({ ...order, ...updates, status: values.status as OrderStatus })
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            toast.error("更新に失敗しました")
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[80vh] overflow-y-auto max-w-lg">
                <DialogHeader>
                    <DialogTitle>注文情報の編集</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ステータス</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="ステータスを選択" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="未対応">未対応</SelectItem>
                                            <SelectItem value="製造中">製造中</SelectItem>
                                            <SelectItem value="発送済">発送済</SelectItem>
                                            <SelectItem value="キャンセル">キャンセル</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="customer_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>顧客名</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="product_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>商品</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="選択" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {products.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
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
                                        <FormLabel>数量</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={1} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
                                            className="flex space-x-4"
                                        >
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="配送" />
                                                </FormControl>
                                                <FormLabel className="font-normal">配送</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="その他" />
                                                </FormControl>
                                                <FormLabel className="font-normal">その他</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {watchDeliveryMethod === '配送' && (
                            <div className="space-y-3 border-l-2 pl-3">
                                <FormField
                                    control={form.control}
                                    name="postal_code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>郵便番号</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>住所</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>電話番号</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
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
                                    <FormLabel>チーム名</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="remarks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>備考</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>キャンセル</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>更新する</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
