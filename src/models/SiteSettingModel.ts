import { db } from "@/lib/db";
import { site_settings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { InferSelectModel } from 'drizzle-orm';

export type SiteSetting = InferSelectModel<typeof site_settings>;

export interface SiteSettingCreateData {
  site_name?: string;
  site_title?: string;
  site_description?: string;
  site_email?: string;
  site_url?: string;
  posts_per_page?: number;
  introduction?: string;
  site_footer?: string;
}

export interface SiteSettingUpdateData extends Partial<SiteSettingCreateData> {}

export async function getSiteSettings(): Promise<SiteSetting | null> {
  try {
    const result = await db().select()
      .from(site_settings)
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('查找设置失败:', error);
    return null;
  }
}



export async function upsertSiteSettings(data: SiteSettingCreateData): Promise<SiteSetting | null> {
  try {
    const existing = await getSiteSettings();
    
    if (existing) {
      return await updateSiteSettings(existing.id, data);
    } else {
      return await createSiteSettings(data);
    }
  } catch (error) {
    console.error('Error upserting setting:', error);
    return null;
  }
}

export async function createSiteSettings(data: SiteSettingCreateData): Promise<SiteSetting | null> {
  try {
    const result = await db().insert(site_settings).values({
      ...data,
      posts_per_page: data.posts_per_page || 10
    }).returning();

    return result[0];
  } catch (error) {
    console.error('创建设置失败:', error);
    return null;
  }
}

export async function updateSiteSettings(id: number, data: SiteSettingUpdateData): Promise<SiteSetting | null> {
  try {
    const cleanData: Record<string, any> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanData[key] = value;
      }
    });

    if (Object.keys(cleanData).length === 0) {
      return getSiteSettings();
    }

    const result = await db().update(site_settings)
      .set(cleanData)
      .where(eq(site_settings.id, id))
      .returning();
    
    return result[0] || null;
  } catch (error) {
    console.error('更新设置失败:', error);
    return null;
  }
}



