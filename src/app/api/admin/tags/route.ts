import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth';
import { TagController } from '@/controllers/TagController';

const tagController = new TagController();

export async function GET(request: NextRequest) {
  try {
    const tokenVerification = await verifyToken(request);
    if (!tokenVerification.valid || !tokenVerification.admin) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权' 
      }, { status: 401 });
    }

    const result = await tagController.getAllTags();
    
    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error || '获取标签失败' 
      }, { status: 500 });
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

export async function POST(request: NextRequest) {
  try {
    const tokenVerification = await verifyToken(request);
    if (!tokenVerification.valid || !tokenVerification.admin) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权' 
      }, { status: 401 });
    }

    const body = await request.json() as { name: string; description?: string };
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ 
        success: false, 
        error: '标签名称不能为空' 
      }, { status: 400 });
    }

    const result = await tagController.createTag({
      name,
      description: description || ''
    });

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error || '创建标签失败' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: '标签创建成功'
    });
  } catch (error) {
    console.error('创建标签失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}