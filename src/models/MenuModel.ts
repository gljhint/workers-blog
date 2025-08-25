import { db } from "@/lib/db";
import { menus } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import type { InferSelectModel } from 'drizzle-orm';

export type Menu = InferSelectModel<typeof menus>;

export interface CreateMenuData {
  title: string;
  url: string;
  target?: string;
  icon?: string;
  description?: string;
  parent_id?: number;
  menu_order?: number;
  level?: number;
  path?: string;
}

export async function getAllMenus(): Promise<Menu[]> {
  try {
    const result = await db().select()
      .from(menus)
      .orderBy(asc(menus.menu_order));

    return result;
  } catch (error) {
    console.error('获取所有菜单失败:', error);
    return [];
  }
}

export async function getActiveMenus(): Promise<Menu[]> {
  try {
    const result = await db().select()
      .from(menus)
      .where(eq(menus.is_active, true))
      .orderBy(asc(menus.menu_order));

    return result;
  } catch (error) {
    console.error('获取菜单失败:', error);
    return [];
  }
}

export async function findMenuById(id: number): Promise<Menu | null> {
  try {
    const result = await db().select()
      .from(menus)
      .where(eq(menus.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('根据ID查找菜单失败:', error);
    return null;
  }
}

export async function createMenu(data: CreateMenuData): Promise<Menu | null> {
  try {
    const now = new Date().toISOString();
    const result = await db().insert(menus).values({
      ...data,
      target: data.target || '_self',
      menu_order: data.menu_order || 0,
      is_active: true,
      level: data.level || 0,
      created_at: now,
      updated_at: now
    }).returning();

    return (result as Menu[])[0] || null;
  } catch (error) {
    console.error('创建菜单失败:', error);
    return null;
  }
}

export async function updateMenu(id: number, data: Partial<CreateMenuData>): Promise<Menu | null> {
  try {
    const updateData: any = {
      ...data,
      updated_at: new Date().toISOString()
    };

    const result = await db().update(menus)
      .set(updateData)
      .where(eq(menus.id, id))
      .returning();

    return (result as Menu[])[0] || null;
  } catch (error) {
    console.error('更新菜单失败:', error);
    return null;
  }
}

export async function deleteMenu(id: number): Promise<boolean> {
  try {
    await db().delete(menus)
      .where(eq(menus.id, id));

    return true;
  } catch (error) {
    console.error('删除菜单失败:', error);
    return false;
  }
}