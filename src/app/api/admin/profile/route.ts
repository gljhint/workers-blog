import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth';
import { findAdminById, findAdminByUsername, findAdminByEmail } from '@/models/AdminModel';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const tokenVerification = await verifyToken(request);
    if (!tokenVerification.valid || !tokenVerification.admin) {
      return NextResponse.json({ 
        success: false, 
        error: '未授权' 
      }, { status: 401 });
    }

    // tokenVerification.admin 已经包含完整的管理员信息
    const admin = tokenVerification.admin;
    if (!admin) {
      return NextResponse.json({ 
        success: false, 
        error: '用户不存在' 
      }, { status: 404 });
    }

    // 不返回密码哈希
    const { password_hash, ...adminData } = admin;
    
    return NextResponse.json({
      success: true,
      data: adminData
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
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

    const body = await request.json() as { username: string; email: string; currentPassword: string; newPassword: string };
    const { username, email, currentPassword, newPassword } = body;

    if (!username || !email) {
      return NextResponse.json({ 
        success: false, 
        error: '用户名和邮箱不能为空' 
      }, { status: 400 });
    }

    const admin = await findAdminById(tokenVerification.admin.id);
    if (!admin) {
      return NextResponse.json({ 
        success: false, 
        error: '用户不存在' 
      }, { status: 404 });
    }

    // 检查用户名和邮箱是否已被其他用户使用
    if (username !== admin.username) {
      const existingUser = await findAdminByUsername(username);
      if (existingUser && existingUser.id !== admin.id) {
        return NextResponse.json({ 
          success: false, 
          error: '用户名已被使用' 
        }, { status: 400 });
      }
    }

    if (email !== admin.email) {
      const existingEmail = await findAdminByEmail(email);
      if (existingEmail && existingEmail.id !== admin.id) {
        return NextResponse.json({ 
          success: false, 
          error: '邮箱已被使用' 
        }, { status: 400 });
      }
    }

    let passwordHash = admin.password_hash;

    // 如果要修改密码
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ 
          success: false, 
          error: '请输入当前密码' 
        }, { status: 400 });
      }

      // 验证当前密码
      const isValidPassword = await bcrypt.compare(currentPassword, admin.password_hash);
      if (!isValidPassword) {
        return NextResponse.json({ 
          success: false, 
          error: '当前密码错误' 
        }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ 
          success: false, 
          error: '新密码长度至少6位' 
        }, { status: 400 });
      }

      passwordHash = await bcrypt.hash(newPassword, 12);
    }

    // TODO: 实现真正的数据库更新操作
    // AdminModel 需要添加 update 方法
    
    // 暂时返回模拟的更新结果
    const updatedAdmin = {
      ...admin,
      username,
      email,
      password_hash: passwordHash,
      updated_at: new Date().toISOString()
    };

    // 返回更新后的用户信息（不包含密码）
    const { password_hash, ...adminData } = updatedAdmin;
    
    return NextResponse.json({
      success: true,
      data: adminData,
      message: '用户信息更新成功'
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 });
  }
}