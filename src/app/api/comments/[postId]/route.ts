import { NextRequest, NextResponse } from 'next/server';
import { getCommentsWithReplies, buildCommentTree, createComment } from '@/models/CommentModel';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {

    const { postId: postIdParam } = await params;
    const postId = parseInt(postIdParam);
    if (isNaN(postId)) {
      return NextResponse.json({ 
        success: false, 
        error: '无效的文章ID' 
      }, { status: 400 });
    }

    const comments = await getCommentsWithReplies(postId);
    
    // 构建树形结构
    const commentsTree = buildCommentTree(comments);
    
    return NextResponse.json({
      success: true,
      data: commentsTree
    });
  } catch (error) {
    console.error('获取文章评论失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}