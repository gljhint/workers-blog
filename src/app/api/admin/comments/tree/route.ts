import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth';
import { getAllComments, buildCommentTree } from '@/models/CommentModel';

export async function GET(request: NextRequest) {
  try {
    const tokenVerification = await verifyToken(request);
    if (!tokenVerification.valid || !tokenVerification.admin) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // 层级结构需要更多数据
    const status = searchParams.get('status') || 'all';
    const postId = searchParams.get('post_id');

    let result;
    if (postId) {
      // 如果指定了文章ID，只获取该文章的评论
      const allComments = await getAllComments(1, 1000, status === 'all' ? undefined : status);
      const filteredComments = allComments.comments.filter(comment => 
        comment.post_id === parseInt(postId)
      );
      result = {
        comments: filteredComments,
        total: filteredComments.length
      };
    } else {
      result = await getAllComments(page, limit, status === 'all' ? undefined : status);
    }

    // 构建树形结构
    const commentsTree = buildCommentTree(result.comments);
    
    return NextResponse.json({
      success: true,
      data: commentsTree,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      }
    });
  } catch (error) {
    console.error('获取评论树失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}