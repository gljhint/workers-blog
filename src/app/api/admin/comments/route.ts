import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth';
import { getAllComments, searchComments, updateCommentsStatus, deleteComment } from '@/models/CommentModel';

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
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all';
    const keyword = searchParams.get('keyword');

    let result;
    if (keyword) {
      result = await searchComments(keyword, page, limit);
    } else {
      result = await getAllComments(page, limit, status === 'all' ? undefined : status);
    }
    
    return NextResponse.json({
      success: true,
      data: result.comments,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      }
    });
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tokenVerification = await verifyToken(request);
    if (!tokenVerification.valid || !tokenVerification.admin) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { action, ids, status } = body;

    if (action === 'updateStatus' && Array.isArray(ids) && status) {
      const validStatuses = ['approved', 'rejected', 'spam'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ 
          success: false, 
          error: '无效的状态' 
        }, { status: 400 });
      }

      // Convert status to boolean (only 'approved' becomes true, others false)
      const isApproved = status === 'approved';
      const success = await updateCommentsStatus(ids, isApproved);
      
      if (success) {
        return NextResponse.json({
          success: true,
          message: `已${status === 'approved' ? '批准' : status === 'rejected' ? '拒绝' : '标记为垃圾'}评论`
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          error: '更新状态失败' 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: '无效的操作' 
    }, { status: 400 });
  } catch (error) {
    console.error('批量操作评论失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const tokenVerification = await verifyToken(request);
    if (!tokenVerification.valid || !tokenVerification.admin) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '请选择要删除的评论' 
      }, { status: 400 });
    }

    let deletedCount = 0;
    for (const id of ids) {
      const success = await deleteComment(id);
      if (success) deletedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `已删除 ${deletedCount} 条评论`
    });
  } catch (error) {
    console.error('删除评论失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}