import { NextRequest, NextResponse } from 'next/server';
import { PostController } from '@/controllers/PostController';
import { PostValidator } from '@/validators/postValidator';
import { createSuccessResponse, createErrorResponse, NotFoundError } from '@/utils/errors';
import { authMiddleware } from '@/middleware/auth';

const postController = new PostController();

// 获取单个文章
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        createErrorResponse(new Error('无效的文章 ID')),
        { status: 400 }
      );
    }

    const result = await postController.getPostById(id);

    if (!result.success) {
      return NextResponse.json(
        createErrorResponse(new NotFoundError('文章')),
        { status: 404 }
      );
    }

    return NextResponse.json(createSuccessResponse(result.data));
  } catch (error) {
    console.error('Error fetching post:', error);
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.statusCode || 500 }
    );
  }
}

// 更新文章
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 认证中间件检查
  const authResult = await authMiddleware(request);
  if (authResult) return authResult;

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        createErrorResponse(new Error('无效的文章 ID')),
        { status: 400 }
      );
    }

    const data = await request.json();
    
    // 数据验证
    PostValidator.validateUpdatePost(data);

    // 更新文章
    const result = await postController.updatePost(id, {
      title: data.title,
      description: data.description,
      content: data.content, // 使用富文本编辑器的HTML内容
      is_published: data.is_published !== undefined ? Boolean(data.is_published) : undefined,
      is_featured: data.is_featured !== undefined ? Boolean(data.is_featured) : undefined,
      tag_ids: Array.isArray(data.tag_ids) ? data.tag_ids : undefined,
      category_id: data.category_id ? parseInt(data.category_id) : undefined,
      cover_image: data.cover_image,
      allow_comments: data.allow_comments !== undefined ? Boolean(data.allow_comments) : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        createErrorResponse(new Error(result.error || '更新文章失败')),
        { status: 400 }
      );
    }

    return NextResponse.json(createSuccessResponse(result.data));
  } catch (error) {
    console.error('Error updating post:', error);
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.statusCode || 500 }
    );
  }
}

// 删除文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 认证中间件检查
  const authResult = await authMiddleware(request);
  if (authResult) return authResult;

  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        createErrorResponse(new Error('无效的文章 ID')),
        { status: 400 }
      );
    }

    const result = await postController.deletePost(id);

    if (!result.success) {
      return NextResponse.json(
        createErrorResponse(new Error(result.error || '删除文章失败')),
        { status: 400 }
      );
    }

    return NextResponse.json(createSuccessResponse({ deleted: true }));
  } catch (error) {
    console.error('Error deleting post:', error);
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.statusCode || 500 }
    );
  }
}