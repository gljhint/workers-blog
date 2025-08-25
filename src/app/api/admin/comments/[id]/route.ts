import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth';
import { findCommentById, updateComment, deleteComment } from '@/models/CommentModel';

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
    const idInt = parseInt(id);
    if (isNaN(idInt)) {
      return NextResponse.json({ 
        success: false, 
        error: '无效的评论ID' 
      }, { status: 400 });
    }

    const comment = await findCommentById(idInt);
    
    if (!comment) {
      return NextResponse.json({ 
        success: false, 
        error: '评论不存在' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}

export async function PUT(
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
    const idInt = parseInt(id);
    if (isNaN(idInt)) {
      return NextResponse.json({ 
        success: false, 
        error: '无效的评论ID' 
      }, { status: 400 });
    }

    const body = await request.json() as {
      author_name: string;
      author_email: string;
      author_website: string;
      content: string;
      status: string;
    };
    const { author_name, author_email, author_website, content, status } = body;

    if (!author_name || !author_email || !content) {
      return NextResponse.json({ 
        success: false, 
        error: '作者姓名、邮箱和内容不能为空' 
      }, { status: 400 });
    }

    if (!/\S+@\S+\.\S+/.test(author_email)) {
      return NextResponse.json({ 
        success: false, 
        error: '请输入有效的邮箱地址' 
      }, { status: 400 });
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'spam'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ 
        success: false, 
        error: '无效的状态' 
      }, { status: 400 });
    }

    const comment = await updateComment(idInt, {
      author_name,
      author_email,
      author_website,
      content,
      is_approved: status === 'approved'
    });

    if (!comment) {
      return NextResponse.json({ 
        success: false, 
        error: '更新评论失败' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: comment,
      message: '评论更新成功'
    });
  } catch (error) {
    console.error('更新评论失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}

export async function DELETE(
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
    const idInt = parseInt(id);
    if (isNaN(idInt)) {
      return NextResponse.json({ 
        success: false, 
        error: '无效的评论ID' 
      }, { status: 400 });
    }

    const success = await deleteComment(idInt);

    if (!success) {
      return NextResponse.json({ 
        success: false, 
        error: '删除评论失败' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: '评论删除成功'
    });
  } catch (error) {
    console.error('删除评论失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}