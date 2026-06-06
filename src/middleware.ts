import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'famton_access'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1年

export function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl
    const accessKey = process.env.SITE_ACCESS_KEY

    // 環境変数が未設定の場合はローカル開発とみなしてスルー
    if (!accessKey) return NextResponse.next()

    const cookieValue = request.cookies.get(COOKIE_NAME)?.value
    const queryKey = searchParams.get('key')

    // クッキーが有効なら通過
    if (cookieValue === accessKey) {
        return NextResponse.next()
    }

    // URLに正しいキーがあればクッキーをセットしてクリーンなURLにリダイレクト
    if (queryKey === accessKey) {
        const cleanUrl = new URL(pathname, request.url)
        const response = NextResponse.redirect(cleanUrl)
        response.cookies.set(COOKIE_NAME, accessKey, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: COOKIE_MAX_AGE,
            sameSite: 'lax',
            path: '/',
        })
        return response
    }

    // 認証失敗 → トップページへ
    return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
    matcher: ['/factory/:path*', '/admin/:path*'],
}
