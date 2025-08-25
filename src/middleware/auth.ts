import { NextRequest, NextResponse } from 'next/server';
import { AuthController } from '@/controllers/AuthController';

const authController = new AuthController();

/**
 * 认证中间件 - 验证管理员权限
 * 返回 NextResponse 表示认证失败，返回 null 表示认证成功
 */
export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: '未登录，请先登录' },
        { status: 401 }
      );
    }

    const result = await authController.verifyToken(token);

    if (!result.success) {
      // 清除无效的 cookie
      const response = NextResponse.json(
        { success: false, error: result.error || '认证失败，请重新登录' },
        { status: 401 }
      );
      response.cookies.delete('auth-token');
      return response;
    }

    // 认证成功，将用户信息添加到请求头中供后续使用
    request.headers.set('x-admin-id', result.data!.id.toString());
    request.headers.set('x-admin-username', result.data!.username);
    request.headers.set('x-admin-email', result.data!.email);

    // 返回 null 表示认证成功，允许继续处理请求
    return null;
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { success: false, error: '认证过程中发生错误' },
      { status: 500 }
    );
  }
}

/**
 * 检查路径是否需要认证保护
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    '/admin',
    '/api/posts',
    '/api/categories',
    '/api/tags'
  ];

  // 排除登录相关的 API
  const excludedRoutes = [
    '/api/auth/login',
    '/api/auth/verify'
  ];

  if (excludedRoutes.some(route => pathname.startsWith(route))) {
    return false;
  }

  // 检查是否是受保护的路由
  return protectedRoutes.some(route => {
    if (pathname === route) return true;
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });
}

/**
 * 验证 Token 并返回管理员信息
 */
export async function verifyToken(request: NextRequest): Promise<{
  valid: boolean;
  admin?: any;
  error?: string;
}> {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return { valid: false, error: '未找到认证令牌' };
    }

    const result = await authController.verifyToken(token);

    if (!result.success || !result.data) {
      return { valid: false, error: result.error || '令牌验证失败' };
    }

    // 通过AuthController获取完整的管理员信息
    const { findAdminById } = await import('@/models/AdminModel');
    const adminResult = await findAdminById(result.data.id);
    if (!adminResult) {
      return { valid: false, error: '用户不存在' };
    }

    return {
      valid: true,
      admin: adminResult
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false, error: '令牌验证过程中发生错误' };
  }
}

/**
 * 获取请求中的管理员信息
 */
export function getAdminFromRequest(request: NextRequest) {
  return {
    id: parseInt(request.headers.get('x-admin-id') || '0'),
    username: request.headers.get('x-admin-username') || '',
    email: request.headers.get('x-admin-email') || ''
  };
}