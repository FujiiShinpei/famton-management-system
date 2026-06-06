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
import { addAdvanceExpense } from "@/app/actions"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
    date: z.string().min(1, "日付を入力してください"),
    category: z.string().min(1, "カテゴリーを選択してください"),
    amount: z.coerce.number().min(1, "金額を入力してください"),
    description: z.string().min(1, "詳細を入力してください"),
})

export function AdvanceExpenseForm() {
    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            category: "材料費",
            amount: 0,
            description: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>): Promise<void> {
        try {
            await addAdvanceExpense({
                date: new Date(values.date).toISOString(),
                category: values.category,
                amount: values.amount,
                description: values.description,
            })
            toast.success("立替金を登録しました。未払い工賃に追加されました。")
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
                <CardTitle>立替金登録</CardTitle>
                <CardDescription>
                    工場で立て替えた材料費・仕入れ・機械代などを登録します。
                    登録した金額は経費一覧と未払い工賃の両方に反映されます。
                </CardDescription>
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
                                            <SelectItem value="仕入れ">仕入れ</SelectItem>
                                            <SelectItem value="機械・設備">機械・設備</SelectItem>
                                            <SelectItem value="消耗品費">消耗品費</SelectItem>
                                            <SelectItem value="交通費">交通費</SelectItem>
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
                                    <FormLabel>立替金額 (円)</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={1} {...field} />
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
                                    <FormLabel>詳細・品名</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="例: バドミントン用シャトル素材 50個" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "登録中..." : "立替金を登録する"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
