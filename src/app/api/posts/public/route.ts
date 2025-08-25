import { NextRequest, NextResponse } from 'next/server';
import { PostController } from '@/controllers/PostController';
import { createSuccessResponse, createErrorResponse } from '@/utils/errors';

const postController = new PostController();

// 获取公开文章列表（仅发布的文章）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');

    // 只获取已发布的文章
    const result = await postController.getPublishedPosts({
      page,
      limit,
      category: category || undefined,
      tag: tag || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        createErrorResponse(new Error(result.error || '获取文章失败')),
        { status: 500 }
      );
    }

    return NextResponse.json(createSuccessResponse(result.data));
  } catch (error) {
    console.error('Error fetching public posts:', error);
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.statusCode || 500 }
    );
  }
}