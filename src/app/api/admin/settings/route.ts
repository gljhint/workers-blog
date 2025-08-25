import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth';
import { getSiteSettings, upsertSiteSettings } from '@/models/SiteSettingModel';

export async function GET(request: NextRequest) {
  try {
    const tokenVerification = await verifyToken(request);
    if (!tokenVerification.valid || !tokenVerification.admin) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权' 
      }, { status: 401 });
    }

    const settings = await getSiteSettings();
    
    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('获取站点设置失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
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

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ 
        success: false, 
        error: '无效的设置数据' 
      }, { status: 400 });
    }

    // 验证设置键，只包含 schema 中实际存在的字段
    const validKeys = [
      'site_name',
      'site_title',
      'site_description',
      'site_email',
      'site_url',
      'posts_per_page',
      'introduction',
      'site_footer'
    ];

    const filteredSettings: Record<string, any> = {};
    for (const [key, value] of Object.entries(settings)) {
      if (validKeys.includes(key)) {
        // 特殊处理 posts_per_page，确保它是数字
        if (key === 'posts_per_page') {
          filteredSettings[key] = typeof value === 'number' ? value : parseInt(value as string);
        } else if (typeof value === 'string' || value === null || value === undefined) {
          filteredSettings[key] = value;
        }
      }
    }

    if (Object.keys(filteredSettings).length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '没有有效的设置数据' 
      }, { status: 400 });
    }

    const updatedSettings = await upsertSiteSettings(filteredSettings);
    
    if (updatedSettings) {
      return NextResponse.json({
        success: true,
        data: updatedSettings,
        message: '站点设置更新成功'
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: '更新失败' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('更新站点设置失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}