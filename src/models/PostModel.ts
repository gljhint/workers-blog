import { db } from "@/lib/db";
import { posts, categories, tags, post_tags } from "@/lib/schema";
import { eq, and, desc, count, like, sql } from "drizzle-orm";
import type { InferSelectModel } from 'drizzle-orm';

export type Post = InferSelectModel<typeof posts>;

export interface CreatePostData {
  title: string;
  slug: string;
  content: string;
  description?: string;
  is_published?: boolean;
  is_featured?: boolean;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  cover_image?: string;
  category_id?: number;
  author_id?: number;
  published_at?: string;
  allow_comments?: boolean;
}

export interface UpdatePostData extends Partial<CreatePostData> {}

export interface PostListParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  keyword?: string;
  is_published?: boolean;
}
export async function getAllPosts(): Promise<Post[]> {
  try {
    const result = await db().select()
      .from(posts)
      .orderBy(desc(posts.created_at));

    return result;
  } catch (error) {
    console.error('获取所有文章失败:', error);
    return [];
  }
}

export async function getPublishedPosts(): Promise<Post[]> {
  try {
    const result = await db().select()
      .from(posts)
      .where(eq(posts.is_published, true))
      .orderBy(desc(posts.published_at), desc(posts.created_at));

    return result;
  } catch (error) {
    console.error('获取已发布文章失败:', error);
    return [];
  }
}

export async function findPostBySlug(slug: string): Promise<Post | null> {
  try {
    const result = await db().select()
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('根据slug获取文章失败:', error);
    return null;
  }
}

export async function findPostById(id: number): Promise<Post | null> {
  try {
    const result = await db().select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('根据ID获取文章失败:', error);
    return null;
  }
}

export async function createPost(data: CreatePostData): Promise<Post | null> {
  try {
    const now = new Date().toISOString();
    const result = await db().insert(posts).values({
      ...data,
      is_published: data.is_published ?? false,
      is_featured: data.is_featured ?? false,
      view_count: data.view_count ?? 0,
      like_count: data.like_count ?? 0,
      comment_count: data.comment_count ?? 0,
      allow_comments: data.allow_comments ?? true,
      created_at: now,
      updated_at: now
    }).returning();

    return result[0];
  } catch (error) {
    console.error('创建文章失败:', error);
    return null;
  }
}

export async function updatePost(id: number, data: UpdatePostData): Promise<Post | null> {
  try {
    const cleanData: Record<string, any> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanData[key] = value;
      }
    });

    if (Object.keys(cleanData).length === 0) {
      return findPostById(id);
    }

    cleanData.updated_at = new Date().toISOString();

    const result = await db().update(posts)
      .set(cleanData)
      .where(eq(posts.id, id))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error('更新文章失败:', error);
    return null;
  }
}

export async function deletePost(id: number): Promise<boolean> {
  try {
    await db().delete(posts)
      .where(eq(posts.id, id));

    return true;
  } catch (error) {
    console.error('删除文章失败:', error);
    return false;
  }
}

export async function postSlugExists(slug: string, excludeId?: number): Promise<boolean> {
  try {
    let query = db().select({ count: count() })
      .from(posts)
      .where(eq(posts.slug, slug));
    
    if (excludeId) {
      query = db().select({ count: count() })
        .from(posts)
        .where(and(eq(posts.slug, slug), eq(posts.id, excludeId)));
    }

    const result = await query;
    return (result[0]?.count || 0) > 0;
  } catch (error) {
    console.error('检查文章slug是否存在失败:', error);
    return false;
  }
}

export async function generateUniquePostSlug(title: string): Promise<string> {
  let baseSlug = title.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();

  let slug = baseSlug;
  let counter = 1;

  while (await postSlugExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export async function incrementPostViewCount(slug: string): Promise<boolean> {
  try {
    const currentPost = await findPostBySlug(slug);
    if (!currentPost) {
      return false;
    }

    await db().update(posts)
      .set({ 
        view_count: (currentPost.view_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .where(eq(posts.slug, slug));
    
    return true;
  } catch (error) {
    console.error('增加文章浏览量失败:', error);
    return false;
  }
}

export async function getPostArchiveStats(): Promise<{year: number, count: number}[]> {
  try {
    const result = await db()
      .select({
        year: sql<number>`CAST(strftime('%Y', ${posts.created_at}) AS INTEGER)`.as('year'),
        count: count().as('count')
      })
      .from(posts)
      .where(eq(posts.is_published, true))
      .groupBy(sql`strftime('%Y', ${posts.created_at})`)
      .orderBy(desc(sql`strftime('%Y', ${posts.created_at})`));

    return result.map(row => ({
      year: row.year,
      count: row.count
    }));
  } catch (error) {
    console.error('获取归档统计失败:', error);
    return [];
  }
}

// 根据分类slug获取已发布的文章
export async function getPostsByCategorySlug(categorySlug: string): Promise<Post[]> {
  try {
    const result = await db()
      .select()
      .from(posts)
      .innerJoin(categories, eq(posts.category_id, categories.id))
      .where(and(
        eq(posts.is_published, true),
        eq(categories.slug, categorySlug)
      ))
      .orderBy(desc(posts.published_at));

    return result.map(row => row.posts);
  } catch (error) {
    console.error('根据分类获取文章失败:', error);
    return [];
  }
}

// 根据标签slug获取已发布的文章
export async function getPostsByTagSlug(tagSlug: string): Promise<Post[]> {
  try {
    const result = await db()
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        content: posts.content,
        description: posts.description,
        is_published: posts.is_published,
        is_featured: posts.is_featured,
        view_count: posts.view_count,
        like_count: posts.like_count,
        comment_count: posts.comment_count,
        cover_image: posts.cover_image,
        category_id: posts.category_id,
        author_id: posts.author_id,
        published_at: posts.published_at,
        allow_comments: posts.allow_comments,
        created_at: posts.created_at,
        updated_at: posts.updated_at
      })
      .from(posts)
      .innerJoin(post_tags, eq(posts.id, post_tags.post_id))
      .innerJoin(tags, eq(post_tags.tag_id, tags.id))
      .where(and(
        eq(posts.is_published, true),
        eq(tags.slug, tagSlug)
      ))
      .orderBy(desc(posts.published_at));

    return result;
  } catch (error) {
    console.error('根据标签获取文章失败:', error);
    return [];
  }
}

// 获取所有文章（包含分类和作者信息）- 管理后台使用
export async function getAllPostsWithDetails(): Promise<any[]> {
  try {
    const result = await db()
      .select()
      .from(posts)
      .leftJoin(categories, eq(posts.category_id, categories.id))
      .orderBy(desc(posts.created_at));

    return result.map(row => ({
      id: row.posts.id,
      title: row.posts.title,
      slug: row.posts.slug,
      description: row.posts.description,
      content: row.posts.content,
      is_published: row.posts.is_published,
      is_featured: row.posts.is_featured,
      view_count: row.posts.view_count,
      like_count: row.posts.like_count,
      comment_count: row.posts.comment_count,
      cover_image: row.posts.cover_image,
      category_id: row.posts.category_id,
      author_id: row.posts.author_id,
      published_at: row.posts.published_at,
      allow_comments: row.posts.allow_comments,
      created_at: row.posts.created_at,
      updated_at: row.posts.updated_at,
      category: row.categories ? {
        id: row.categories.id,
        name: row.categories.name,
        slug: row.categories.slug,
        description: row.categories.description
      } : null
    }));
  } catch (error) {
    console.error('获取所有文章详情失败:', error);
    return [];
  }
}