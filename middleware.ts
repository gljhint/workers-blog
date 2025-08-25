import { NextRequest, NextResponse } from 'next/server';
import { AuthController } from './src/controllers/AuthController';

const authController = new AuthController();

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
      // 验证 token
      const result = await authController.verifyToken(token);
      
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
        const result = await authController.verifyToken(token);
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