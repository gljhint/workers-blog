import { NextRequest, NextResponse } from 'next/server';
import { getAllPages, createPage, deletePage, pageSlugExists } from '@/models/PageModel';
import { verifyToken } from '@/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.valid) {
      return NextResponse.json({ 
        success: false, 
        error: authResult.error 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const keyword = searchParams.get('keyword') || '';
    const is_published = searchParams.get('is_published');
    const show_in_menu = searchParams.get('show_in_menu');

    const params: any = { page, limit };
    
    if (keyword) {
      params.keyword = keyword;
    }
    
    if (is_published === 'true' || is_published === 'false') {
      params.is_published = is_published === 'true';
    }
    
    if (show_in_menu === 'true' || show_in_menu === 'false') {
      params.show_in_menu = show_in_menu === 'true';
    }

    const result = await getAllPages(params);

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('获取页面列表失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.valid) {
      return NextResponse.json({ 
        success: false, 
        error: authResult.error 
      }, { status: 401 });
    }

    const body = await request.json() as {
      slug?: string; // slug 现在是可选的
      title: string;
      content: string;
      meta_title: string;
      meta_description: string;
      meta_keywords: string;
      is_published: boolean;
    };
    const {
      slug,
      title,
      content,
      meta_title,
      meta_description,
      meta_keywords,
      is_published
    } = body;

    // 验证必填字段（现在不需要 slug）
    if (!title || !content) {
      return NextResponse.json({ 
        success: false, 
        error: '请填写标题和内容' 
      }, { status: 400 });
    }

    // 如果提供了 slug，验证slug格式（只允许字母、数字、横线、下划线）
    if (slug && !/^[a-zA-Z0-9-_]+$/.test(slug)) {
      return NextResponse.json({ 
        success: false, 
        error: 'URL别名只能包含字母、数字、横线和下划线' 
      }, { status: 400 });
    }

    // 如果提供了 slug，检查是否已存在
    if (slug) {
      const slugExists = await pageSlugExists(slug);
      if (slugExists) {
        return NextResponse.json({ 
          success: false, 
          error: 'URL别名已存在，请使用其他别名' 
        }, { status: 400 });
      }
    }

    const page = await createPage({
      slug: slug?.trim(), // slug 现在是可选的
      title: title.trim(),
      content: content.trim(),
      meta_title: meta_title?.trim(),
      meta_description: meta_description?.trim(),
      meta_keywords: meta_keywords?.trim(),
      is_published: Boolean(is_published)
    });

    if (!page) {
      return NextResponse.json({ 
        success: false, 
        error: '创建页面失败' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: page,
      message: '页面创建成功'
    });
  } catch (error) {
    console.error('创建页面失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.valid) {
      return NextResponse.json({ 
        success: false, 
        error: authResult.error 
      }, { status: 401 });
    }

    const body = await request.json() as { ids: number[] };
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '请选择要删除的页面' 
      }, { status: 400 });
    }

    // 批量删除页面
    let deletedCount = 0;
    for (const id of ids) {
      const success = await deletePage(id);
      if (success) deletedCount++;
    }
    const success = deletedCount > 0;

    if (!success) {
      return NextResponse.json({ 
        success: false, 
        error: '删除页面失败' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `成功删除 ${deletedCount} 个页面`
    });
  } catch (error) {
    console.error('批量删除页面失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}