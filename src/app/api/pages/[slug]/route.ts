import { NextRequest, NextResponse } from 'next/server';
import { findPageBySlug } from '@/models/PageModel';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ 
        success: false, 
        error: '页面不存在' 
      }, { status: 404 });
    }

    const page = await findPageBySlug(slug);

    if (!page) {
      return NextResponse.json({ 
        success: false, 
        error: '页面不存在' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('获取页面失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}