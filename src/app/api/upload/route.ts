import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth';
import { createSuccessResponse, createErrorResponse } from '@/utils/errors';
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request: NextRequest) {
  // 认证中间件检查
  const authResult = await authMiddleware(request);
  if (authResult) return authResult;

  try {
    // 获取Cloudflare绑定
    const { env } = await getCloudflareContext({ async: true });
    const bucket = env.BUCKET as R2Bucket;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'general';

    if (!file) {
      return NextResponse.json(
        createErrorResponse(new Error('没有选择文件')),
        { status: 400 }
      );
    }

    // 验证文件类型
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const audioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'];
    const allowedTypes = [...imageTypes, ...audioTypes];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        createErrorResponse(new Error('不支持的文件类型，只支持图片（JPEG, PNG, GIF, WebP）和音频（MP3, WAV, OGG, M4A, AAC）格式')),
        { status: 400 }
      );
    }

    // 根据文件类型设置不同的大小限制
    const isAudio = audioTypes.includes(file.type);
    const maxSize = isAudio ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 音频50MB，图片10MB
    
    if (file.size > maxSize) {
      const maxSizeText = isAudio ? '50MB' : '10MB';
      return NextResponse.json(
        createErrorResponse(new Error(`文件大小不能超过 ${maxSizeText}`)),
        { status: 400 }
      );
    }

    // 生成文件名和路径
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${originalName}`;
    
    // 根据文件类型和用途确定保存目录
    let uploadDir: string;
    if (type === 'cover') {
      uploadDir = 'covers';
    } else if (audioTypes.includes(file.type)) {
      uploadDir = 'audio';
    } else {
      uploadDir = 'images';
    }
    
    // R2对象键（路径）
    const objectKey = `uploads/${uploadDir}/${fileName}`;
    
    // 准备文件数据
    const bytes = await file.arrayBuffer();
    
    // 上传到R2
    const uploadResult = await bucket.put(objectKey, bytes, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000', // 1年缓存
      },
    });

    if (!uploadResult) {
      throw new Error('上传到R2失败');
    }

    // 生成文件访问URL
    // 如果有自定义域名，使用自定义域名；否则使用R2的public URL
    const bucketUrl = process.env.NEXT_PUBLIC_R2_DOMAIN || 
                      `https://my-blog-assets.r2.dev`; // R2的默认public域名
    const fileUrl = `${bucketUrl}/${objectKey}`;
    
    return NextResponse.json(createSuccessResponse({
      url: fileUrl,
      filename: fileName,
      type: file.type,
      size: file.size
    }));
    
  } catch (error) {
    console.error('文件上传失败:', error);
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.statusCode || 500 }
    );
  }
}
