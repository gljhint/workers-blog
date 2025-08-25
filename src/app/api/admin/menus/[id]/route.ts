import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth';
import { findMenuById, updateMenu, deleteMenu } from '@/models/MenuModel';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tokenVerification = await verifyToken(request);
    if (!tokenVerification.valid || !tokenVerification.admin) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权' 
      }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ 
        success: false, 
        error: '无效的菜单ID' 
      }, { status: 400 });
    }

    const menu = await findMenuById(id);
    
    if (!menu) {
      return NextResponse.json({ 
        success: false, 
        error: '菜单不存在' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: menu
    });
  } catch (error) {
    console.error('获取菜单失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tokenVerification = await verifyToken(request);
    if (!tokenVerification.valid || !tokenVerification.admin) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权' 
      }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ 
        success: false, 
        error: '无效的菜单ID' 
      }, { status: 400 });
    }

    const body = await request.json();
    const { title, url, icon, parent_id, menu_order, target, description } = body;

    if (!title || !url) {
      return NextResponse.json({ 
        success: false, 
        error: '菜单标题和链接不能为空' 
      }, { status: 400 });
    }

    // 检查是否试图将菜单设为自己的子菜单
    if (parent_id === id) {
      return NextResponse.json({ 
        success: false, 
        error: '菜单不能设为自己的子菜单' 
      }, { status: 400 });
    }

    const menu = await updateMenu(id, {
      title,
      url,
      icon,
      description,
      parent_id: parent_id || undefined,
      menu_order,
      target
    });

    if (!menu) {
      return NextResponse.json({ 
        success: false, 
        error: '更新菜单失败' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: menu,
      message: '菜单更新成功'
    });
  } catch (error) {
    console.error('更新菜单失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '服务器错误' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tokenVerification = await verifyToken(request);
    if (!tokenVerification.valid || !tokenVerification.admin) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权' 
      }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ 
        success: false, 
        error: '无效的菜单ID' 
      }, { status: 400 });
    }

    const success = await deleteMenu(id);

    if (!success) {
      return NextResponse.json({ 
        success: false, 
        error: '删除菜单失败' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: '菜单删除成功'
    });
  } catch (error) {
    console.error('删除菜单失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '服务器错误' 
    }, { status: 500 });
  }
}