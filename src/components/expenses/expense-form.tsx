"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addExpense } from "@/app/actions"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const formSchema = z.object({
    date: z.string().min(1, "日付を入力してください"),
    category: z.string().min(1, "カテゴリーを選択または入力してください"),
    amount: z.coerce.number().min(1, "金額を入力してください"),
    description: z.string().min(1, "詳細を入力してください"),
})

export function ExpenseForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            category: "材料費",
            amount: 0,
            description: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await addExpense({
                date: new Date(values.date).toISOString(),
                category: values.category,
                amount: values.amount,
                description: values.description,
            })
            toast.success("経費を登録しました")
            form.reset({
                date: new Date().toISOString().split('T')[0],
                category: "材料費",
                amount: 0,
                description: "",
            })
        } catch (error) {
            console.error(error)
            toast.error("登録に失敗しました")
        }
    }

    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle>経費入力</CardTitle>
                <CardDescription>新しい経費データを登録します。</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>日付</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>カテゴリー</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="カテゴリーを選択" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="材料費">材料費</SelectItem>
                                            <SelectItem value="消耗品費">消耗品費</SelectItem>
                                            <SelectItem value="会議費">会議費</SelectItem>
                                            <SelectItem value="交通費">交通費</SelectItem>
                                            <SelectItem value="通信費">通信費</SelectItem>
                                            <SelectItem value="その他">その他</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>金額 (円)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>詳細</FormLabel>
                                    <FormControl>
                                        <Input placeholder="具体的な内容など" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full">
                            登録
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
