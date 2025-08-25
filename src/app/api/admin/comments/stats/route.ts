import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth';
import { getCommentStats, getRecentComments } from '@/models/CommentModel';

export async function GET(request: NextRequest) {
  try {
    const tokenVerification = await verifyToken(request);
    if (!tokenVerification.valid || !tokenVerification.admin) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权' 
      }, { status: 401 });
    }

    const stats = await getCommentStats();
    const recentComments = await getRecentComments(5);
    
    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentComments
      }
    });
  } catch (error) {
    console.error('获取评论统计失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}