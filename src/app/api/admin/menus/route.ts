import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth';
import { getAllMenus, createMenu, updateMenu } from '@/models/MenuModel';

export async function GET(request: NextRequest) {
  try {
    const tokenVerification = await verifyToken(request);
    if (!tokenVerification.valid || !tokenVerification.admin) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权' 
      }, { status: 401 });
    }

    const menus = await getAllMenus();
    
    return NextResponse.json({
      success: true,
      data: menus
    });
  } catch (error) {
    console.error('获取菜单失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tokenVerification = await verifyToken(request);
    if (!tokenVerification.valid || !tokenVerification.admin) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权' 
      }, { status: 401 });
    }

    const body = await request.json() as {
      title: string;
      url: string;
      icon?: string;
      parent_id?: number;
      menu_order?: number;
      target?: string;
      description?: string;
    };
    const { title, url, icon, parent_id, menu_order, target, description } = body;

    if (!title || !url) {
      return NextResponse.json({ 
        success: false, 
        error: '菜单标题和链接不能为空' 
      }, { status: 400 });
    }

    const menu = await createMenu({
      title,
      url,
      icon,
      description,
      parent_id: parent_id || undefined,
      menu_order: menu_order || 0,
      target: target || '_self'
    });

    if (!menu) {
      return NextResponse.json({ 
        success: false, 
        error: '创建菜单失败' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: menu,
      message: '菜单创建成功'
    });
  } catch (error) {
    console.error('创建菜单失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '服务器错误' 
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

    const body = await request.json() as { menuOrders: Array<{ id: number; order: number }> };
    const { menuOrders } = body;

    if (!Array.isArray(menuOrders)) {
      return NextResponse.json({ 
        success: false, 
        error: '无效的排序数据' 
      }, { status: 400 });
    }

    // 批量更新菜单顺序
    let successCount = 0;
    for (const item of menuOrders) {
      const result = await updateMenu(item.id, { menu_order: item.order });
      if (result) successCount++;
    }
    const success = successCount > 0;
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: '菜单排序更新成功'
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: '更新排序失败' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('更新菜单排序失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}