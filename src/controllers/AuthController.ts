import { validateAdminLogin, findAdminById, AdminLoginData } from '@/models/AdminModel';
import jwt from 'jsonwebtoken';

export interface JWTPayload {
  id: number;
  username: string;
  email: string;
}

/**
 * 认证控制器
 */
export class AuthController {

  /**
   * 管理员登录
   */
  async login(data: AdminLoginData): Promise<{ success: boolean; data?: { token: string; admin: any }; error?: string }> {
    try {
      const result = await validateAdminLogin(data);
      
      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      // 生成 JWT token
      const payload: JWTPayload = {
        id: result.data.id,
        username: result.data.username,
        email: result.data.email,
      };

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '24h' }
      );

      // 返回时不包含密码哈希
      const { password_hash, ...adminData } = result.data;

      return {
        success: true,
        data: {
          token,
          admin: adminData
        }
      };
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, error: '登录过程中发生错误' };
    }
  }

  /**
   * 验证 JWT token
   */
  async verifyToken(token: string): Promise<{ success: boolean; data?: JWTPayload; error?: string }> {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      ) as JWTPayload;

      // 验证用户是否仍然存在
      const admin = await findAdminById(decoded.id);
      if (!admin) {
        return { success: false, error: '用户不存在' };
      }

      return { success: true, data: decoded };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { success: false, error: 'Token 已过期' };
      } else if (error instanceof jwt.JsonWebTokenError) {
        return { success: false, error: 'Token 无效' };
      }
      
      console.error('Error verifying token:', error);
      return { success: false, error: 'Token 验证失败' };
    }
  }

  /**
   * 刷新 token
   */
  async refreshToken(token: string): Promise<{ success: boolean; data?: { token: string }; error?: string }> {
    try {
      const verification = await this.verifyToken(token);
      
      if (!verification.success || !verification.data) {
        return { success: false, error: verification.error };
      }

      // 生成新的 token
      const newToken = jwt.sign(
        verification.data,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '24h' }
      );

      return {
        success: true,
        data: { token: newToken }
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      return { success: false, error: '刷新 Token 失败' };
    }
  }

  /**
   * 登出（实际上是让客户端删除 token）
   */
  async logout(): Promise<{ success: boolean }> {
    // JWT 是无状态的，登出主要在客户端处理
    // 这里可以添加黑名单机制，但简单起见先这样处理
    return { success: true };
  }
}