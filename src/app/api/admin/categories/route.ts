import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth';
import { CategoryController } from '@/controllers/CategoryController';

const categoryController = new CategoryController();

export async function GET(request: NextRequest) {
  try {
    const tokenVerification = await verifyToken(request);
    if (!tokenVerification.valid || !tokenVerification.admin) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权' 
      }, { status: 401 });
    }

    const result = await categoryController.getAllCategories();
    
    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error || '获取分类失败' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('获取分类失败:', error);
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
      name: string;
      slug?: string;
      description?: string;
    };
    const { name, slug, description } = body;

    if (!name) {
      return NextResponse.json({ 
        success: false, 
        error: '分类名称不能为空' 
      }, { status: 400 });
    }

    const result = await categoryController.createCategory({
      name,
      slug,
      description: description || ''
    });

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error || '创建分类失败' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: '分类创建成功'
    });
  } catch (error) {
    console.error('创建分类失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}