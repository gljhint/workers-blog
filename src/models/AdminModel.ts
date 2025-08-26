import { db } from "@/lib/db";
import { admins } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from 'bcryptjs';
import type { InferSelectModel } from 'drizzle-orm';

export type Admin = InferSelectModel<typeof admins>;

export interface CreateAdminData {
  username: string;
  email: string;
  password_hash: string;
  display_name?: string;
  bio?: string;
  avatar?: string;
}

export interface AdminLoginData {
  username: string;
  password: string;
}

export interface UpdateAdminData {
  username?: string;
  email?: string;
  password_hash?: string;
  display_name?: string;
  bio?: string;
  avatar?: string;
}

export async function findAdminByUsername(username: string): Promise<Admin | null> {
  try {
    const result = await db().select()
      .from(admins)
      .where(eq(admins.username, username))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('根据用户名查找管理员失败:', error);
    return null;
  }
}

export async function findAdminByEmail(email: string): Promise<Admin | null> {
  try {
    const result = await db().select()
      .from(admins)
      .where(eq(admins.email, email))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('根据邮箱查找管理员失败:', error);
    return null;
  }
}

export async function findAdminById(id: number): Promise<Admin | null> {
  try {
    const result = await db().select()
      .from(admins)
      .where(eq(admins.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('根据ID查找管理员失败:', error);
    return null;
  }
}

export async function createAdmin(data: CreateAdminData): Promise<Admin | null> {
  try {
    const now = new Date().toISOString();
    const result = await db().insert(admins).values({
      ...data,
      is_active: true,
      created_at: now,
      updated_at: now
    }).returning();

    return result[0];
  } catch (error) {
    console.error('创建管理员失败:', error);
    return null;
  }
}

export async function updateLastLogin(id: number): Promise<boolean> {
  try {
    await db().update(admins)
      .set({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .where(eq(admins.id, id));

    return true;
  } catch (error) {
    console.error('更新最后登录时间失败:', error);
    return false;
  }
}

export async function updateAdmin(id: number, data: UpdateAdminData): Promise<Admin | null> {
  try {
    const cleanData: Record<string, any> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanData[key] = value;
      }
    });

    if (Object.keys(cleanData).length === 0) {
      return findAdminById(id);
    }

    cleanData.updated_at = new Date().toISOString();

    const result = await db().update(admins)
      .set(cleanData)
      .where(eq(admins.id, id))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error('更新管理员信息失败:', error);
    return null;
  }
}

export async function validateAdminLogin(data: AdminLoginData): Promise<{ success: boolean; data?: Admin; error?: string }> {
  try {
    const admin = await findAdminByUsername(data.username);
    
    if (!admin) {
      return { success: false, error: '用户名或密码错误' };
    }

    if (!admin.is_active) {
      return { success: false, error: '账户已被禁用' };
    }

    const isPasswordValid = await bcrypt.compare(data.password, admin.password_hash);
    
    if (!isPasswordValid) {
      return { success: false, error: '用户名或密码错误' };
    }

    await updateLastLogin(admin.id);

    return { success: true, data: admin };
  } catch (error) {
    console.error('验证登录失败:', error);
    return { success: false, error: '登录验证失败' };
  }
}