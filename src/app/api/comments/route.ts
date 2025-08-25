import { NextRequest, NextResponse } from 'next/server';
import { createComment } from '@/models/CommentModel';

export async function POST(request: NextRequest) {
  try {

    const body = await request.json() as {
      post_id: number;
      author_name: string;
      author_email: string;
      author_url: string;
      content: string;
      parent_id: number | null;
    };
    const { post_id, author_name, author_email, author_url, content, parent_id } = body;

    // 验证必填字段
    if (!post_id || !author_name || !author_email || !content) {
      return NextResponse.json({ 
        success: false, 
        error: '请填写所有必填字段' 
      }, { status: 400 });
    }

    // 验证邮箱格式
    if (!/\S+@\S+\.\S+/.test(author_email)) {
      return NextResponse.json({ 
        success: false, 
        error: '请输入有效的邮箱地址' 
      }, { status: 400 });
    }

    // 验证内容长度
    if (content.length > 1000) {
      return NextResponse.json({ 
        success: false, 
        error: '评论内容不能超过1000字符' 
      }, { status: 400 });
    }

    // 获取客户端信息
    const ip_address = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const user_agent = request.headers.get('user-agent') || 'unknown';

    // 创建评论
    const comment = await createComment({
      post_id,
      author_name: author_name.trim(),
      author_email: author_email.trim(),
      author_website: author_url?.trim() || undefined,
      content: content.trim(),
      author_ip: ip_address,
      user_agent,
      parent_id: parent_id || undefined
    });

    if (!comment) {
      return NextResponse.json({ 
        success: false, 
        error: '评论提交失败' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: comment,
      message: '评论提交成功，等待审核'
    });
  } catch (error) {
    console.error('创建评论失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}