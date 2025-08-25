import { NextRequest, NextResponse } from 'next/server';
import { TagController } from '@/controllers/TagController';
import { TagValidator } from '@/validators/tagValidator';
import { createSuccessResponse, createErrorResponse } from '@/utils/errors';
import { authMiddleware, getAdminFromRequest } from '@/middleware/auth';

const tagController = new TagController();

// 获取所有标签（公开接口，不需要认证）
export async function GET() {
  try {
    const result = await tagController.getAllTags();
    
    if (!result.success) {
      return NextResponse.json(
        createErrorResponse(new Error(result.error || '获取标签失败')),
        { status: 500 }
      );
    }

    return NextResponse.json(createSuccessResponse(result.data));
  } catch (error) {
    console.error('Error fetching tags:', error);
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.statusCode || 500 }
    );
  }
}

// 创建标签（需要认证）
export async function POST(request: NextRequest) {
  // 认证中间件检查
  const authResult = await authMiddleware(request);
  if (authResult) return authResult;

  try {
    const data = await request.json() as {
      name: string;
      description: string;
    };
    
    // 数据验证
    TagValidator.validateCreateTag(data);

    // 创建标签
    const result = await tagController.createTag({
      name: data.name.trim(),
      description: data.description?.trim() || '',
    });

    if (!result.success) {
      return NextResponse.json(
        createErrorResponse(new Error(result.error || '创建标签失败')),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createSuccessResponse(result.data),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating tag:', error);
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.statusCode || 500 }
    );
  }
}