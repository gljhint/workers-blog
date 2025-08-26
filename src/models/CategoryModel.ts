import { db } from "@/lib/db";
import { categories, posts } from "@/lib/schema";
import { eq, count, desc, and } from "drizzle-orm";
import type { InferSelectModel } from 'drizzle-orm';
import { generateSlugFromText } from "@/lib/slugUtils";

export type Category = InferSelectModel<typeof categories>;

export interface CreateCategoryData {
  name: string;
  slug?: string;
  description?: string;
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const result = await db().select()
      .from(categories)
      .orderBy(categories.name);

    return result;
  } catch (error) {
    console.error('获取分类列表失败:', error);
    return [];
  }
}

export async function getCategoriesWithPostCount(): Promise<(Category & { post_count: number })[]> {
  try {
    const result = await db().select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      post_count: categories.post_count,
      created_at: categories.created_at,
      updated_at: categories.updated_at,
    })
      .from(categories)
      .orderBy(categories.name);

    return result.map(row => ({
      ...row,
      post_count: row.post_count || 0
    }));
  } catch (error) {
    console.error('获取分类列表（含文章数）失败:', error);
    return [];
  }
}

export async function findCategoryById(id: number): Promise<Category | null> {
  try {
    const result = await db().select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('根据ID查找分类失败:', error);
    return null;
  }
}

export async function findCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const result = await db().select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('根据slug查找分类失败:', error);
    return null;
  }
}

async function generateUniqueCategorySlug(name: string): Promise<string> {
  let baseSlug = generateSlugFromTitle(name);
  
  // 如果生成的slug为空，使用默认值
  if (!baseSlug || baseSlug.trim() === '' || baseSlug === '-') {
    const timestamp = Date.now();
    baseSlug = `category-${timestamp}`;
  }
  
  let slug = baseSlug;
  let counter = 1;
  while (await categorySlugExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

/**
 * 从标题生成slug，支持中文转拼音
 */
function generateSlugFromTitle(title: string): string {
  return generateSlugFromText(title);
}


async function categorySlugExists(slug: string): Promise<boolean> {
  try {
    const result = await db().select({ count: count() })
      .from(categories)
      .where(eq(categories.slug, slug));
    
    return (result[0]?.count || 0) > 0;
  } catch (error) {
    console.error('检查slug是否存在失败:', error);
    return false;
  }
}

export async function createCategory(data: CreateCategoryData): Promise<Category | null> {
  try {
    const slug = data.slug || await generateUniqueCategorySlug(data.name);
    const now = new Date().toISOString();
    
    const result = await db().insert(categories).values({
      name: data.name,
      slug,
      description: data.description || null,
      created_at: now,
      updated_at: now
    }).returning();

    return result[0];
  } catch (error) {
    console.error('创建分类失败:', error);
    return null;
  }
}

export async function updateCategory(id: number, data: Partial<CreateCategoryData>): Promise<Category | null> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.slug !== undefined) {
      updateData.slug = data.slug;
    } else if (data.name !== undefined) {
      // 如果修改了名称但没有提供slug，则重新生成slug
      updateData.slug = await generateUniqueCategorySlug(data.name);
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    const result = await db().update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error('更新分类失败:', error);
    return null;
  }
}

export async function countCategoryPosts(categoryId: number): Promise<number> {
  try {
    const result = await db().select({ count: count() })
      .from(posts)
      .where(eq(posts.category_id, categoryId));
    
    return result[0]?.count || 0;
  } catch (error) {
    console.error('统计分类使用数量失败:', error);
    return 0;
  }
}

export async function deleteCategory(id: number): Promise<boolean> {
  try {
    await db().delete(categories)
      .where(eq(categories.id, id));

    return true;
  } catch (error) {
    console.error('删除分类失败:', error);
    return false;
  }
}

export async function updateCategoryPostCount(categoryId: number): Promise<boolean> {
  try {
    const countResult = await db().select({ count: count() })
      .from(posts)
      .where(and(
        eq(posts.category_id, categoryId),
        eq(posts.is_published, true)
      ));

    const postCount = countResult[0]?.count || 0;

    await db().update(categories)
      .set({ 
        post_count: postCount,
        updated_at: new Date().toISOString()
      })
      .where(eq(categories.id, categoryId));

    return true;
  } catch (error) {
    console.error('更新分类文章数量失败:', error);
    return false;
  }
}

export async function recalculateAllCategoryPostCounts(): Promise<boolean> {
  try {
    const allCategories = await getAllCategories();
    
    for (const category of allCategories) {
      await updateCategoryPostCount(category.id);
    }

    return true;
  } catch (error) {
    console.error('重新计算所有分类文章数量失败:', error);
    return false;
  }
}