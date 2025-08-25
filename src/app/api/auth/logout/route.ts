import { NextResponse } from 'next/server';
import { createSuccessResponse } from '@/utils/errors';

export async function POST() {
  try {
    const response = NextResponse.json(createSuccessResponse({
      message: '登出成功'
    }));

    // 清除认证 cookie
    response.cookies.delete('auth-token');

    return response;
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { success: false, error: '登出失败' },
      { status: 500 }
    );
  }
}