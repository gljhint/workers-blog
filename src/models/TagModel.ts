import { db } from "@/lib/db";
import { tags, posts, post_tags } from "@/lib/schema";
import { eq, count, and } from "drizzle-orm";
import type { InferSelectModel } from 'drizzle-orm';

export type Tag = InferSelectModel<typeof tags>;

export interface CreateTagData {
  name: string;
  description?: string;
}

export async function getAllTags(): Promise<Tag[]> {
  try {
    const result = await db().select()
      .from(tags)
      .orderBy(tags.name);

    return result;
  } catch (error) {
    console.error('获取标签列表失败:', error);
    return [];
  }
}

export async function findTagBySlug(slug: string): Promise<Tag | null> {
  try {
    const result = await db().select()
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('根据slug查找标签失败:', error);
    return null;
  }
}

export async function findOrCreateTagByName(name: string): Promise<Tag | null> {
  try {
    const existing = await db().select()
      .from(tags)
      .where(eq(tags.name, name))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const slug = await generateUniqueTagSlug(name);
    const now = new Date().toISOString();
    const result = await db().insert(tags).values({
      name,
      slug,
      description: '',
      created_at: now,
      updated_at: now
    }).returning();

    return result[0];
  } catch (error) {
    console.error('查找或创建标签失败:', error);
    return null;
  }
}

export async function generateUniqueTagSlug(name: string): Promise<string> {
  let baseSlug = name.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();

  let slug = baseSlug;
  let counter = 1;

  while (await tagSlugExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export async function tagSlugExists(slug: string): Promise<boolean> {
  try {
    const result = await db().select({ count: count() })
      .from(tags)
      .where(eq(tags.slug, slug));
    
    return (result[0]?.count || 0) > 0;
  } catch (error) {
    console.error('检查slug是否存在失败:', error);
    return false;
  }
}

export async function createTag(data: CreateTagData): Promise<Tag | null> {
  try {
    const slug = await generateUniqueTagSlug(data.name);
    const now = new Date().toISOString();
    
    const result = await db().insert(tags).values({
      name: data.name,
      slug,
      description: data.description,
      created_at: now,
      updated_at: now
    }).returning();

    return result[0];
  } catch (error) {
    console.error('创建标签失败:', error);
    return null;
  }
}


export async function findTagById(id: number): Promise<Tag | null> {
  try {
    const result = await db().select()
      .from(tags)
      .where(eq(tags.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('根据ID查找标签失败:', error);
    return null;
  }
}

export async function updateTag(id: number, data: Partial<CreateTagData>): Promise<Tag | null> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (data.name !== undefined) {
      updateData.name = data.name;
      updateData.slug = await generateUniqueTagSlug(data.name);
    }

    const result = await db().update(tags)
      .set(updateData)
      .where(eq(tags.id, id))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error('更新标签失败:', error);
    return null;
  }
}

export async function deleteTag(id: number): Promise<boolean> {
  try {
    await db().delete(tags)
      .where(eq(tags.id, id));

    return true;
  } catch (error) {
    console.error('删除标签失败:', error);
    return false;
  }
}

export async function updateTagPostCount(tagId: number): Promise<boolean> {
  try {
    const countResult = await db().select({ count: count() })
      .from(post_tags)
      .innerJoin(posts, eq(post_tags.post_id, posts.id))
      .where(and(
        eq(post_tags.tag_id, tagId),
        eq(posts.is_published, true)
      ));

    const postCount = countResult[0]?.count || 0;

    await db().update(tags)
      .set({ 
        post_count: postCount,
        updated_at: new Date().toISOString()
      })
      .where(eq(tags.id, tagId));

    return true;
  } catch (error) {
    console.error('更新标签文章数量失败:', error);
    return false;
  }
}

export async function recalculateAllTagPostCounts(): Promise<boolean> {
  try {
    const allTags = await getAllTags();
    
    for (const tag of allTags) {
      await updateTagPostCount(tag.id);
    }

    return true;
  } catch (error) {
    console.error('重新计算所有标签文章数量失败:', error);
    return false;
  }
}