import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth';
import { getRepliesByCommentId, findCommentById } from '@/models/CommentModel';

// GET /api/admin/comments/[id]/replies - 获取评论的所有回复
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tokenVerification = await verifyToken(request);
    if (!tokenVerification.valid || !tokenVerification.admin) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权' 
      }, { status: 401 });
    }

    const { id } = await params;
    const commentId = parseInt(id);
    if (isNaN(commentId)) {
      return NextResponse.json({ 
        success: false, 
        error: '无效的评论ID' 
      }, { status: 400 });
    }

    // 验证评论是否存在
    const comment = await findCommentById(commentId);
    if (!comment) {
      return NextResponse.json({ 
        success: false, 
        error: '评论不存在' 
      }, { status: 404 });
    }

    // 获取回复列表
    const replies = await getRepliesByCommentId(commentId);
    
    return NextResponse.json({
      success: true,
      data: {
        comment,
        replies,
        total: replies.length
      }
    });
  } catch (error) {
    console.error('获取回复列表失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}