import { NextRequest, NextResponse } from 'next/server';
import { findPageById, pageSlugExists, updatePage, deletePage } from '@/models/PageModel';
import { verifyToken } from '@/middleware/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.valid || !authResult.admin) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权' 
      }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ 
        success: false, 
        error: '无效的页面ID' 
      }, { status: 400 });
    }

    const page = await findPageById(id);

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.valid || !authResult.admin) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权' 
      }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ 
        success: false, 
        error: '无效的页面ID' 
      }, { status: 400 });
    }

    const body = await request.json();
    const {
      slug,
      title,
      content,
      meta_title,
      meta_description,
      meta_keywords,
      is_published
    } = body;

    // 验证必填字段
    if (slug !== undefined && !slug.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'URL别名不能为空' 
      }, { status: 400 });
    }

    if (title !== undefined && !title.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: '页面标题不能为空' 
      }, { status: 400 });
    }

    // 验证slug格式
    if (slug && !/^[a-zA-Z0-9-_]+$/.test(slug)) {
      return NextResponse.json({ 
        success: false, 
        error: 'URL别名只能包含字母、数字、横线和下划线' 
      }, { status: 400 });
    }

    // 检查slug是否已存在（排除当前页面）
    if (slug) {
      const slugExists = await pageSlugExists(slug, id);
      if (slugExists) {
        return NextResponse.json({ 
          success: false, 
          error: 'URL别名已存在，请使用其他别名' 
        }, { status: 400 });
      }
    }

    const updateData: any = {};

    if (slug !== undefined) updateData.slug = slug.trim();
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (meta_title !== undefined) updateData.meta_title = meta_title?.trim();
    if (meta_description !== undefined) updateData.meta_description = meta_description?.trim();
    if (meta_keywords !== undefined) updateData.meta_keywords = meta_keywords?.trim();
    if (is_published !== undefined) updateData.is_published = Boolean(is_published);

    const page = await updatePage(id, updateData);

    if (!page) {
      return NextResponse.json({ 
        success: false, 
        error: '更新页面失败' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: page,
      message: '页面更新成功'
    });
  } catch (error) {
    console.error('更新页面失败:', error);
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
    const authResult = await verifyToken(request);
    if (!authResult.valid || !authResult.admin) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权' 
      }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ 
        success: false, 
        error: '无效的页面ID' 
      }, { status: 400 });
    }

    const success = await deletePage(id);

    if (!success) {
      return NextResponse.json({ 
        success: false, 
        error: '删除页面失败' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '页面删除成功'
    });
  } catch (error) {
    console.error('删除页面失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}