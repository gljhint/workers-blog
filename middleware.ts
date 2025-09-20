import { NextRequest, NextResponse } from 'next/server';

// Edge-safe JWT verification (HS256) using Web Crypto API
async function verifyJwtEdge(token: string, secret: string): Promise<{ success: boolean; payload?: any; error?: string }> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { success: false, error: 'Invalid token format' };

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    // Base64URL decode helpers
    const b64urlToUint8 = (b64url: string) => {
      const pad = '='.repeat((4 - (b64url.length % 4)) % 4);
      const b64 = (b64url.replace(/-/g, '+').replace(/_/g, '/')) + pad;
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return bytes;
    };

    const encoder = new TextEncoder();
    const data = encoder.encode(`${encodedHeader}.${encodedPayload}`);
    const signature = b64urlToUint8(encodedSignature);

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const isValid = await crypto.subtle.verify('HMAC', key, signature, data);
    if (!isValid) return { success: false, error: 'Invalid signature' };

    // Parse payload
    const padded = encodedPayload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=');
    const payloadJson = atob(padded);
    const payload = JSON.parse(payloadJson);

    // Check exp (seconds since epoch)
    if (payload?.exp && Date.now() / 1000 >= payload.exp) {
      return { success: false, error: 'Token expired' };
    }

    return { success: true, payload };
  } catch (e) {
    return { success: false, error: 'Verification failed' };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 需要保护的路径
  const protectedPaths = ['/admin'];
  
  // 排除的路径
  const excludedPaths = ['/admin/login'];

  // 检查是否是受保护的路径
  const isProtectedPath = protectedPaths.some(path => {
    return pathname.startsWith(path) && !excludedPaths.some(excluded => pathname.startsWith(excluded));
  });

  if (isProtectedPath) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      // 没有 token，重定向到登录页
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // 使用 Edge 兼容的方式验证 token（HS256）
      const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      const result = await verifyJwtEdge(token, secret);

      if (!result.success) {
        // token 无效，清除 cookie 并重定向
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('auth-token');
        return response;
      }

      // 认证成功，继续请求
      return NextResponse.next();
    } catch (error) {
      console.error('Middleware auth error:', error);
      const loginUrl = new URL('/admin/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth-token');
      return response;
    }
  }

  // 如果已登录用户访问登录页，重定向到管理后台
  if (pathname === '/admin/login') {
    const token = request.cookies.get('auth-token')?.value;
    
    if (token) {
      try {
        const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        const result = await verifyJwtEdge(token, secret);
        if (result.success) {
          // 检查是否有重定向参数
          const redirectTo = request.nextUrl.searchParams.get('redirect') || '/admin';
          return NextResponse.redirect(new URL(redirectTo, request.url));
        }
      } catch (error) {
        // token 无效，清除 cookie
        const response = NextResponse.next();
        response.cookies.delete('auth-token');
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了以下开头的：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - 静态文件扩展名
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
