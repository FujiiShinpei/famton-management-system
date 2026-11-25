import { Clock } from "lucide-react";
import { DELAY_NOTICE } from "@/lib/notice";

// 製造遅延のお知らせ表示。variant="bar" はページ上部の帯、"box" はフォーム内の枠
export function DelayNotice({ variant = "box", className = "" }: { variant?: "bar" | "box"; className?: string }) {
    if (!DELAY_NOTICE.enabled) return null;

    if (variant === "bar") {
        return (
            <div className={`border-b border-amber-300 bg-amber-50 ${className}`} role="status">
                <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-3 text-sm text-amber-900">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                        <span className="font-bold">【お知らせ】{DELAY_NOTICE.title}。</span>
                        {DELAY_NOTICE.message}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 ${className}`} role="status">
            <Clock className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
                <p className="font-bold">{DELAY_NOTICE.title}</p>
                <p className="mt-1 leading-relaxed">{DELAY_NOTICE.message}</p>
            </div>
        </div>
    );
}
