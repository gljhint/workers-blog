import { NextResponse } from 'next/server';
import { CategoryController } from '@/controllers/CategoryController';
import { createSuccessResponse, createErrorResponse } from '@/utils/errors';

const categoryController = new CategoryController();

export async function GET() {
  try {
    const result = await categoryController.getAllCategories();
    
    if (!result.success) {
      return NextResponse.json(
        createErrorResponse(new Error(result.error || '获取分类失败')),
        { status: 500 }
      );
    }

    return NextResponse.json(createSuccessResponse(result.data));
  } catch (error) {
    console.error('Error fetching categories:', error);
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.statusCode || 500 }
    );
  }
}