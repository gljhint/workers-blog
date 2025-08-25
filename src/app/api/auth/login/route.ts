import { NextRequest, NextResponse } from 'next/server';
import { AuthController } from '@/controllers/AuthController';
import { createSuccessResponse, createErrorResponse, ValidationError } from '@/utils/errors';

const authController = new AuthController();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as { username: string; password: string };
    
    // 基本验证
    if (!data.username || !data.password) {
      throw new ValidationError('用户名和密码不能为空');
    }

    if (data.username.length < 3 || data.username.length > 50) {
      throw new ValidationError('用户名长度必须在 3-50 个字符之间');
    }

    if (data.password.length < 6) {
      throw new ValidationError('密码长度不能少于 6 个字符');
    }

    // 登录验证
    const result = await authController.login({
      username: data.username.trim(),
      password: data.password
    });

    if (!result.success) {
      return NextResponse.json(
        createErrorResponse(new Error(result.error || '登录失败')),
        { status: 401 }
      );
    }

    // 设置 HTTP-only cookie
    const response = NextResponse.json(createSuccessResponse({
      message: '登录成功',
      admin: result.data!.admin
    }));

    response.cookies.set('auth-token', result.data!.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 小时
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Error during login:', error);
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.statusCode || 500 }
    );
  }
}