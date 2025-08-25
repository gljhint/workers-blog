import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth';
import { TagController } from '@/controllers/TagController';

const tagController = new TagController();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tokenVerification = await verifyToken(request);
    if (!tokenVerification.valid || !tokenVerification.admin) {
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
        error: '无效的标签ID' 
      }, { status: 400 });
    }

    const result = await tagController.getTagById(id);
    
    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error || '获取标签失败' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('获取标签失败:', error);
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
    const tokenVerification = await verifyToken(request);
    if (!tokenVerification.valid || !tokenVerification.admin) {
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
        error: '无效的标签ID' 
      }, { status: 400 });
    }

    const body = await request.json() as { name: string; description?: string };
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ 
        success: false, 
        error: '标签名称不能为空' 
      }, { status: 400 });
    }

    const result = await tagController.updateTag(id, {
      name,
      description: description || ''
    });

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error || '更新标签失败' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: '标签更新成功'
    });
  } catch (error) {
    console.error('更新标签失败:', error);
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
    const tokenVerification = await verifyToken(request);
    if (!tokenVerification.valid || !tokenVerification.admin) {
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
        error: '无效的标签ID' 
      }, { status: 400 });
    }

    const result = await tagController.deleteTag(id);

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error || '删除标签失败' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: '标签删除成功'
    });
  } catch (error) {
    console.error('删除标签失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}