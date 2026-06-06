"use client"

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from 'lucide-react'

export type MenuItem = {
    title: string
    href: string
    description: string
    icon: React.ReactNode
}

interface DashboardMenuProps {
    items: MenuItem[]
}

export function DashboardMenu({ items }: DashboardMenuProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item) => (
                <Link href={item.href} key={item.href} className="block h-full">
                    <Card className="hover:bg-slate-50 transition-colors cursor-pointer h-full border-2 hover:border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                {item.icon}
                                {item.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}
