import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, ClipboardList, Wallet, Package, Truck, Receipt, Boxes, ArrowRight, Mail } from "lucide-react";
import { SHIPPING_RATE_TABLE, ZONE_DISPLAY } from "@/lib/shipping-rates";
import { DelayNotice } from "@/components/delay-notice";

// トップページは Google Sheets を読まない静的ページ（アクセスが増えても API 制限にかからない）

// ロゴから取ったブランドカラー
// 濃い赤: #7a2a2c / 赤: #e2363c / 黄: #f5b236 / 背景用の深い赤: #2e1011

const CONTACT_EMAIL = "famton.fami.bad@gmail.com";

const steps = [
  { icon: ClipboardList, title: "ご注文", text: "注文フォームから商品・数量・受取方法を入力してご注文ください。" },
  { icon: Wallet, title: "お支払い", text: "ご注文後にご案内する指定口座へお振込みください。" },
  { icon: Package, title: "製造・準備", text: "ご入金確認後、一つひとつ丁寧に製造・準備いたします。" },
  { icon: Truck, title: "お届け", text: "ご指定の住所へお届けします。発送時にはメールでお知らせします。" },
];

const notes = [
  { icon: Boxes, title: "1回のご注文は5点まで", text: "6点以上をご希望の場合は、お問い合わせいただければ個別にご注文を承ります（ページ下部のお問い合わせ先へご連絡ください）。" },
  { icon: Truck, title: "全国へ配送", text: "送料はお届け先の地域とご注文数によって決まります。下の送料表をご覧ください。" },
  { icon: Receipt, title: "領収書は電子発行", text: "ご注文時に「希望する」を選ぶと、入金確認後にダウンロードURLをメールでお送りします。" },
];

function OrderButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/order"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#f5b236] px-8 py-3.5 font-bold text-[#2e1011] shadow-lg transition hover:bg-[#ffc54d] ${className}`}
    >
      <ShoppingCart className="h-5 w-5" />
      注文フォームへ進む
    </Link>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" aria-label="Famton トップページ">
            <Image
              src="/images/logo-wordmark.png"
              alt="Famton"
              width={641}
              height={146}
              priority
              className="h-8 w-auto md:h-9"
            />
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-gray-600 md:flex">
            <a href="#about" className="hover:text-[#7a2a2c]">Famtonについて</a>
            <a href="#product" className="hover:text-[#7a2a2c]">商品</a>
            <a href="#flow" className="hover:text-[#7a2a2c]">ご注文の流れ</a>
            <a href="#shipping" className="hover:text-[#7a2a2c]">送料</a>
            <a href="#contact" className="hover:text-[#7a2a2c]">お問い合わせ</a>
          </nav>
          <Link
            href="/order"
            className="rounded-full bg-[#e2363c] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#c92b31]"
          >
            ご注文はこちら
          </Link>
        </div>
      </header>

      <DelayNotice variant="bar" />

      <main>
        {/* ヒーロー：写真を背景にして文字を重ねる */}
        <section className="relative overflow-hidden bg-[#2e1011] text-white">
          {/* スマホ：写真全面＋下から暗く / PC：右半分に写真、左へ向かって背景色に溶け込む */}
          <div className="absolute inset-0 md:left-[38%]">
            <Image
              src="/images/hero-gym.webp"
              alt="体育館の床に置かれたFamtonのシャトルとラケット"
              fill
              priority
              sizes="(min-width: 768px) 62vw, 100vw"
              className="object-cover object-[center_65%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2e1011] via-[#2e1011]/75 to-[#2e1011]/20 md:bg-gradient-to-r md:from-[#2e1011] md:via-[#2e1011]/30 md:to-transparent" />
          </div>

          <div className="relative mx-auto flex min-h-[620px] max-w-6xl items-end px-4 pb-14 pt-32 md:min-h-[600px] md:items-center md:py-20">
            <div className="max-w-lg">
              <Image
                src="/images/logo-mark-white.png"
                alt="Famtonロゴ"
                width={576}
                height={915}
                className="h-20 w-auto drop-shadow md:h-24"
              />
              <p className="mt-6 text-xs font-bold tracking-[0.3em] text-[#f5b236]">FAMILY BADMINTON BRAND</p>
              <h1 className="mt-3 text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">
                FOR THE LOVE<br />OF THE GAME.
              </h1>
              <p className="mt-5 text-xl font-bold md:text-2xl">ファミリーバドミントンを、もっと楽しく。</p>
              <p className="mt-4 leading-relaxed text-white/85">
                競技を楽しむ人から、仲間とプレーする人まで。<br />
                ファミリーバドミントン用品をFamtonから。
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <OrderButton />
                <a
                  href="#flow"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/60 px-8 py-3.5 font-bold text-white transition hover:bg-white/10"
                >
                  ご注文の流れ
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ポイント */}
        <section className="border-b bg-[#fff8ea]">
          <div className="mx-auto grid max-w-6xl gap-px px-4 md:grid-cols-3">
            {notes.map((n) => (
              <div key={n.title} className="flex gap-3 py-6 md:px-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5b236]/25">
                  <n.icon className="h-5 w-5 text-[#7a2a2c]" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#7a2a2c]">{n.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{n.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Famtonについて */}
        <section id="about" className="scroll-mt-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2">
            <Image
              src="/images/about-shuttle.webp"
              alt="Famtonシャトル"
              width={740}
              height={810}
              className="mx-auto w-full max-w-md md:max-w-lg"
            />
            <div>
              <p className="text-xs font-bold tracking-[0.3em] text-[#e2363c]">ABOUT</p>
              <h2 className="mt-2 text-3xl font-extrabold text-[#2e1011]">Famtonについて</h2>
              <p className="mt-6 text-lg font-bold leading-relaxed text-[#7a2a2c]">
                スポーツを、もっと楽しく。<br />
                ファミリーバドミントンを、もっと身近に。
              </p>
              <div className="mt-6 space-y-4 leading-relaxed text-gray-600">
                <p>Famtonは、ファミリーバドミントン用品を中心に展開するスポーツブランドです。</p>
                <p>私たちは、ファミリーバドミントンを楽しむすべての人に、より良いプレー環境とスポーツの楽しさを届けることを目指しています。</p>
                <p>主力商品である「Famtonシャトル」は、バドミントンの羽根と柔らかなウレタンスポンジを組み合わせた、ファミリーバドミントン専用のシャトルです。</p>
                <p>素材や加工、製品の品質にこだわりながら、一つひとつの商品と向き合っています。</p>
                <p>競技を楽しむ方から大会に参加する方まで、多くの人に愛される製品づくりを目指して。Famtonは、ファミリーバドミントンのさらなる普及と発展に貢献していきます。</p>
              </div>
              <p className="mt-6 border-l-4 border-[#f5b236] pl-4 text-sm leading-relaxed text-gray-600">
                チームや個人の方からのご注文を、インターネットから承っております。
              </p>
            </div>
          </div>
        </section>

        {/* 商品 */}
        <section id="product" className="scroll-mt-20 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <p className="text-center text-xs font-bold tracking-[0.3em] text-[#e2363c]">PRODUCT</p>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-[#2e1011]">商品</h2>
            <div className="mx-auto mt-10 grid max-w-4xl overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200 md:grid-cols-2">
              <Image
                src="/images/shuttle-box.webp"
                alt="12個入りの箱に並んだFamtonシャトル"
                width={924}
                height={686}
                className="h-full w-full object-cover"
              />
              <div className="flex flex-col justify-center p-8">
                <h3 className="text-2xl font-extrabold text-[#2e1011]">Famtonシャトル</h3>
                <p className="mt-2 font-bold text-[#e2363c]">1ダース（12個入り）</p>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  バドミントンの羽根と柔らかなウレタンスポンジを組み合わせた、ファミリーバドミントン専用のシャトルです。
                  価格は注文フォームでご確認ください。
                </p>
                <Link
                  href="/order"
                  className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#e2363c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c92b31]"
                >
                  注文する
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ご注文の流れ */}
        <section id="flow" className="scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <p className="text-center text-xs font-bold tracking-[0.3em] text-[#e2363c]">FLOW</p>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-[#2e1011]">ご注文の流れ</h2>
            <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.title} className="relative rounded-2xl border bg-white p-6 pt-8">
                  <span className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-[#e2363c] text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <s.icon className="h-7 w-7 text-[#7a2a2c]" />
                  <h3 className="mt-4 font-bold text-[#2e1011]">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 送料 */}
        <section id="shipping" className="scroll-mt-20 bg-gray-50">
          <div className="mx-auto max-w-3xl px-4 py-20">
            <p className="text-center text-xs font-bold tracking-[0.3em] text-[#e2363c]">SHIPPING</p>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-[#2e1011]">送料（配送の場合）</h2>
            <p className="mt-4 text-center text-sm text-gray-600">
              お届け先の地域とご注文数（ダース）によって決まります。
            </p>
            <div className="mt-8 overflow-x-auto rounded-2xl bg-white ring-1 ring-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-[#7a2a2c] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">地域</th>
                    <th className="px-4 py-3 text-right font-medium">1ダース</th>
                    <th className="px-4 py-3 text-right font-medium whitespace-nowrap">2〜3ダース</th>
                    <th className="px-4 py-3 text-right font-medium whitespace-nowrap">4ダース以上</th>
                  </tr>
                </thead>
                <tbody>
                  {ZONE_DISPLAY.map(({ zone, label }) => {
                    const r = SHIPPING_RATE_TABLE[zone];
                    return (
                      <tr key={zone} className="border-t even:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">{label}</td>
                        <td className="px-4 py-3 text-right">¥{r.small.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">¥{r.medium.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">¥{r.large.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* お問い合わせ */}
        <section id="contact" className="scroll-mt-20">
          <div className="mx-auto max-w-3xl px-4 py-20 text-center">
            <p className="text-xs font-bold tracking-[0.3em] text-[#e2363c]">CONTACT</p>
            <h2 className="mt-2 text-3xl font-extrabold text-[#2e1011]">お問い合わせ</h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              商品についてのご質問や、6点以上のご注文をご希望の場合は、<br className="hidden sm:inline" />
              下記のメールアドレスまでお気軽にお問い合わせください。
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-8 inline-flex max-w-full items-center gap-3 rounded-2xl bg-[#fff8ea] px-6 py-4 ring-1 ring-[#f5b236]/50 transition hover:bg-[#fff1d1]"
            >
              <Mail className="h-6 w-6 shrink-0 text-[#7a2a2c]" />
              <span className="break-all text-lg font-bold text-[#7a2a2c]">{CONTACT_EMAIL}</span>
            </a>
          </div>
        </section>

        {/* 最後のCTA */}
        <section className="relative overflow-hidden bg-[#7a2a2c] text-white">
          <Image
            src="/images/logo-mark-white.png"
            alt=""
            width={576}
            height={915}
            className="pointer-events-none absolute -right-10 -top-10 h-[130%] w-auto opacity-10"
          />
          <div className="relative mx-auto max-w-6xl px-4 py-16 text-center">
            <h2 className="text-3xl font-extrabold">ご注文はこちらから</h2>
            <p className="mt-3 text-sm text-white/80">注文フォームで商品・数量・受取方法を選ぶだけで、簡単にご注文いただけます。</p>
            <OrderButton className="mt-8" />
          </div>
        </section>
      </main>

      <footer className="bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-10 text-center">
          <Image src="/images/logo-color.png" alt="Famton" width={207} height={253} className="h-20 w-auto" />
          <p className="mt-2 text-xs text-gray-500">ファミリーバドミントン用品</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="mt-3 text-xs text-gray-500 hover:text-[#7a2a2c]">
            お問い合わせ：{CONTACT_EMAIL}
          </a>
          <p className="mt-4 text-xs text-gray-400">© {new Date().getFullYear()} Famton</p>
        </div>
      </footer>
    </div>
  );
}
