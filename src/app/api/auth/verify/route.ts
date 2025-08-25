import { NextRequest, NextResponse } from 'next/server';
import { AuthController } from '@/controllers/AuthController';
import { createSuccessResponse, createErrorResponse } from '@/utils/errors';

const authController = new AuthController();

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        createErrorResponse(new Error('未登录')),
        { status: 401 }
      );
    }

    const result = await authController.verifyToken(token);

    if (!result.success) {
      // 清除无效的 cookie
      const response = NextResponse.json(
        createErrorResponse(new Error(result.error || '认证失败')),
        { status: 401 }
      );
      response.cookies.delete('auth-token');
      return response;
    }

    return NextResponse.json(createSuccessResponse({
      authenticated: true,
      admin: result.data
    }));
  } catch (error) {
    console.error('Error during verification:', error);
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.statusCode || 500 }
    );
  }
}