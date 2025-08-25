import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth';
import { createCommentReply, findCommentById, CreateReplyData } from '@/models/CommentModel';

interface RouteParams {
  params: {
    id: string;
  };
}

// POST /api/admin/comments/[id]/reply - 回复评论
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const tokenVerification = await verifyToken(request);
    if (!tokenVerification.valid || !tokenVerification.admin) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权' 
      }, { status: 401 });
    }

    const commentId = parseInt(params.id);
    if (isNaN(commentId)) {
      return NextResponse.json({ 
        success: false, 
        error: '无效的评论ID' 
      }, { status: 400 });
    }

    // 验证父评论是否存在
    const parentComment = await findCommentById(commentId);
    if (!parentComment) {
      return NextResponse.json({ 
        success: false, 
        error: '父评论不存在' 
      }, { status: 404 });
    }

    const body = await request.json();
    const {
      author_name,
      author_email,
      author_website,
      content,
      is_approved
    } = body;

    // 验证必填字段
    if (!author_name || !author_email || !content) {
      return NextResponse.json({ 
        success: false, 
        error: '请填写作者姓名、邮箱和内容' 
      }, { status: 400 });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(author_email)) {
      return NextResponse.json({ 
        success: false, 
        error: '邮箱格式不正确' 
      }, { status: 400 });
    }

    // 创建回复数据
    const replyData: CreateReplyData = {
      parent_id: commentId,
      post_id: parentComment.post_id,
      author_name: author_name.trim(),
      author_email: author_email.trim(),
      author_website: author_website?.trim(),
      content: content.trim(),
      is_approved: is_approved !== false // 管理员回复默认通过
    };

    // 创建回复
    const reply = await createCommentReply(replyData);
    
    if (!reply) {
      return NextResponse.json({ 
        success: false, 
        error: '创建回复失败' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: reply,
      message: '回复创建成功'
    });
  } catch (error) {
    console.error('创建回复失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}