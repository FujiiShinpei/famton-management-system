'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function YearSelector({ currentYear }: { currentYear: number }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // 現在の選択年を取得（クエリパラメータがなければ現在の年）
    const selectedYear = searchParams.get('year') || currentYear.toString()

    // 選択肢として過去5年分を生成
    const years = Array.from({ length: 6 }, (_, i) => currentYear - i)

    const handleYearChange = (year: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('year', year)
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">対象年:</span>
            <Select value={selectedYear} onValueChange={handleYearChange}>
                <SelectTrigger className="w-[120px] bg-white">
                    <SelectValue placeholder="年を選択" />
                </SelectTrigger>
                <SelectContent>
                    {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                            {year}年
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
