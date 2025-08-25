import { db } from "@/lib/db";
import { pages } from "@/lib/schema";
import { eq, and, desc, asc, like, count, ne, or } from "drizzle-orm";
import type { InferSelectModel } from 'drizzle-orm';

export type Page = InferSelectModel<typeof pages>;

export interface CreatePageData {
  slug: string;
  title: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_published?: boolean;
}

export interface UpdatePageData extends Partial<CreatePageData> {}

export interface PageListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  is_published?: boolean;
}

export interface PageListResult {
  data: Page[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function createPage(data: CreatePageData): Promise<Page | null> {
  try {
    const now = new Date().toISOString();
    const result = await db().insert(pages).values({
      ...data,
      is_published: data.is_published ?? false,
      created_at: now,
      updated_at: now
    }).returning();

    return result[0];
  } catch (error) {
    console.error('创建页面失败:', error);
    return null;
  }
}

export async function findPageBySlug(slug: string): Promise<Page | null> {
  try {
    const result = await db().select()
      .from(pages)
      .where(and(eq(pages.slug, slug), eq(pages.is_published, true)))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('获取页面失败:', error);
    return null;
  }
}

export async function findPageById(id: number): Promise<Page | null> {
  try {
    const result = await db().select()
      .from(pages)
      .where(eq(pages.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('获取页面失败:', error);
    return null;
  }
}

export async function getAllPages(params: PageListParams = {}): Promise<PageListResult> {
  try {
    const {
      page = 1,
      limit = 20,
      keyword,
      is_published
    } = params;

    const offset = (page - 1) * limit;
    
    const conditions = [];
    
    if (keyword) {
      conditions.push(
        or(
          like(pages.title, `%${keyword}%`),
          like(pages.content, `%${keyword}%`)
        )
      );
    }

    if (typeof is_published === 'boolean') {
      conditions.push(eq(pages.is_published, is_published));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const countResult = await db().select({ count: count() })
      .from(pages)
      .where(whereCondition);
    
    const totalCount = countResult[0]?.count || 0;

    const dataResult = await db().select()
      .from(pages)
      .where(whereCondition)
      .orderBy(desc(pages.created_at))
      .limit(limit)
      .offset(offset);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: dataResult,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    console.error('获取页面列表失败:', error);
    return {
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  }
}


export async function updatePage(id: number, data: UpdatePageData): Promise<Page | null> {
  try {
    const cleanData: Record<string, any> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanData[key] = value;
      }
    });

    if (Object.keys(cleanData).length === 0) {
      return findPageById(id);
    }

    cleanData.updated_at = new Date().toISOString();

    const result = await db().update(pages)
      .set(cleanData)
      .where(eq(pages.id, id))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error('更新页面失败:', error);
    return null;
  }
}

export async function deletePage(id: number): Promise<boolean> {
  try {
    await db().delete(pages)
      .where(eq(pages.id, id));

    return true;
  } catch (error) {
    console.error('删除页面失败:', error);
    return false;
  }
}

export async function pageSlugExists(slug: string, excludeId?: number): Promise<boolean> {
  try {
    const conditions = [eq(pages.slug, slug)];
    
    if (excludeId) {
      conditions.push(ne(pages.id, excludeId));
    }

    const result = await db().select({ count: count() })
      .from(pages)
      .where(and(...conditions));
    
    return (result[0]?.count || 0) > 0;
  } catch (error) {
    console.error('检查页面slug是否存在失败:', error);
    return false;
  }
}

export async function getMenuPages(): Promise<Page[]> {
  try {
    const result = await db().select()
      .from(pages)
      .where(eq(pages.is_published, true))
      .orderBy(pages.title);

    return result;
  } catch (error) {
    console.error('获取菜单页面失败:', error);
    return [];
  }
}