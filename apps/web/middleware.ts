import { NextRequest, NextResponse } from 'next/server';
import { decodeJwt } from '@/lib/jwt'; // 你需要实现这个解析 JWT 的方法

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const url = request.nextUrl;

  if (url.pathname.startsWith('/user')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const decoded = decodeJwt(token);
      if (decoded.roles.some(r => r === 'admin')) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/user/:path*'], // 只保护 /user 路由段
};