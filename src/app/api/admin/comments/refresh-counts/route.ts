import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth';
import { getAllComments, updateCommentReplyCount } from '@/models/CommentModel';

// POST /api/admin/comments/refresh-counts - 刷新所有评论的回复数量
export async function POST(request: NextRequest) {
  try {
    const tokenVerification = await verifyToken(request);
    if (!tokenVerification.valid || !tokenVerification.admin) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权' 
      }, { status: 401 });
    }

    // 获取所有评论（不分页，获取所有）
    const allComments = await getAllComments(1, 10000); // 假设不会超过10000条评论
    
    let updatedCount = 0;
    const errors: string[] = [];

    // 只更新顶级评论的回复数量（parent_id为null的）
    const topLevelComments = allComments.comments.filter(comment => !comment.parent_id);
    
    for (const comment of topLevelComments) {
      try {
        const success = await updateCommentReplyCount(comment.id);
        if (success) {
          updatedCount++;
        } else {
          errors.push(`更新评论 ${comment.id} 失败`);
        }
      } catch (error) {
        errors.push(`更新评论 ${comment.id} 时出错: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalComments: topLevelComments.length,
        updatedCount,
        errors: errors.length > 0 ? errors : undefined
      },
      message: `已更新 ${updatedCount} 条评论的回复数量${errors.length > 0 ? `，${errors.length} 条失败` : ''}`
    });
  } catch (error) {
    console.error('刷新回复数量失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}