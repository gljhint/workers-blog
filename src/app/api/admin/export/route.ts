import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth';
import { getAllPosts } from '@/models/PostModel';
import { getAllCategories } from '@/models/CategoryModel';
import { getAllTags } from '@/models/TagModel';
import { getAllPages } from '@/models/PageModel';
import { getAllMenus } from '@/models/MenuModel';
import { getAllComments } from '@/models/CommentModel';
import { getSiteSettings } from '@/models/SiteSettingModel';

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
    const type = searchParams.get('type') || 'all';

    let exportData: any = {};

    // 导出文章数据
    if (type === 'all' || type === 'posts') {
      const posts = await getAllPosts();
      exportData.posts = posts;
    }

    // 导出分类数据
    if (type === 'all' || type === 'categories') {
      const categories = await getAllCategories();
      exportData.categories = categories;
    }

    // 导出标签数据
    if (type === 'all' || type === 'tags') {
      const tags = await getAllTags();
      exportData.tags = tags;
    }

    // 导出页面数据
    if (type === 'all' || type === 'pages') {
      const pagesResult = await getAllPages();
      exportData.pages = pagesResult.data;
    }

    // 导出菜单数据
    if (type === 'all' || type === 'menus') {
      const menus = await getAllMenus();
      exportData.menus = menus;
    }

    // 导出评论数据
    if (type === 'all' || type === 'comments') {
      const { comments } = await getAllComments(1, 10000);
      exportData.comments = comments;
    }

    // 导出站点设置
    if (type === 'all' || type === 'settings') {
      const settings = await getSiteSettings();
      exportData.site_settings = settings;
    }

    // 添加元数据
    exportData.meta = {
      export_date: new Date().toISOString(),
      export_type: type,
      version: '1.0',
      total_records: Object.values(exportData).reduce((total: number, arr: any) => 
        total + (Array.isArray(arr) ? arr.length : 0), 0
      )
    };

    // 设置下载响应头
    const filename = `blog-backup-${type}-${new Date().toISOString().split('T')[0]}.json`;
    
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('导出数据失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '导出失败' 
    }, { status: 500 });
  }
}