import { NextRequest, NextResponse } from 'next/server';
import { PostController } from '@/controllers/PostController';
import { PostValidator } from '@/validators/postValidator';
import { createSuccessResponse, createErrorResponse } from '@/utils/errors';
import { authMiddleware, getAdminFromRequest } from '@/middleware/auth';

const postController = new PostController();

// 获取所有文章（管理员）
export async function GET(request: NextRequest) {
  // 认证中间件检查
  const authResult = await authMiddleware(request);
  if (authResult) return authResult;

  try {
    const result = await postController.getAllPosts();
    
    if (!result.success) {
      return NextResponse.json(
        createErrorResponse(new Error(result.error || '获取文章失败')),
        { status: 500 }
      );
    }

    return NextResponse.json(createSuccessResponse(result.data));
  } catch (error) {
    console.error('Error fetching posts:', error);
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.statusCode || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // 认证中间件检查
  const authResult = await authMiddleware(request);
  if (authResult) return authResult;

  try {
    const admin = getAdminFromRequest(request);
    const data = await request.json();
    
    // 数据验证
    PostValidator.validateCreatePost(data);

    // 创建文章
    const result = await postController.createPost({
      title: data.title,
      description: data.description,
      content: data.content, // 使用富文本编辑器的HTML内容
      is_published: Boolean(data.is_published),
      is_featured: Boolean(data.is_featured),
      tag_ids: Array.isArray(data.tag_ids) ? data.tag_ids : [],
      category_id: data.category_id ? parseInt(data.category_id) : undefined,
      author_id: data.author_id ? parseInt(data.author_id) : undefined,
      cover_image: data.cover_image,
      allow_comments: data.allow_comments !== false
    });

    if (!result.success) {
      return NextResponse.json(
        createErrorResponse(new Error(result.error || '创建文章失败')),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createSuccessResponse(result.data),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.statusCode || 500 }
    );
  }
}