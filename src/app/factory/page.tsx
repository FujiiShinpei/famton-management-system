import Link from "next/link";
import { ClipboardList, ReceiptJapaneseYen, Coins, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const menuItems = [
    {
        title: "注文状況の確認",
        href: "/factory/orders",
        description: "注文の受付・発送管理・入金確認",
        icon: <ClipboardList className="h-6 w-6 text-primary" />,
    },
    {
        title: "注文代理入力",
        href: "/factory/proxy-order",
        description: "お客様の代理で新規注文を登録します",
        icon: <UserPlus className="h-6 w-6 text-primary" />,
    },
    {
        title: "立替金登録",
        href: "/factory/expenses",
        description: "材料・仕入れ・機械など立て替えた費用の登録",
        icon: <ReceiptJapaneseYen className="h-6 w-6 text-primary" />,
    },
    {
        title: "未払い工賃の確認",
        href: "/factory/payroll",
        description: "発送済み注文の未払い工賃と建て替え送料の確認・支払い処理",
        icon: <Coins className="h-6 w-6 text-primary" />,
    },
];

export default function FactoryMenuPage() {
    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-2">工場用管理メニュー</h1>
            <p className="text-muted-foreground mb-8">確認・操作したい項目を選択してください</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map((item) => (
                    <Link href={item.href} key={item.href} className="block h-full">
                        <Card className="hover:bg-slate-50 transition-colors cursor-pointer h-full border-2 hover:border-primary/30 hover:shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold flex items-center gap-3">
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
        </div>
    );
}
