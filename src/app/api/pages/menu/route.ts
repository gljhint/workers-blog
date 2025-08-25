import { NextRequest, NextResponse } from 'next/server';
import { getMenuPages } from '@/models/PageModel';

export async function GET() {
  try {
    const pages = await getMenuPages();

    return NextResponse.json({
      success: true,
      data: pages
    });
  } catch (error) {
    console.error('获取菜单页面失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}