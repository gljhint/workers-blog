import { db } from "@/lib/db";
import { post_tags } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function addTagsToPost(postId: number, tagIds: number[]): Promise<boolean> {
  try {
    if (tagIds.length === 0) return true;

    const values = tagIds.map(tagId => ({
      post_id: postId,
      tag_id: tagId,
      created_at: new Date().toISOString()
    }));

    await db().insert(post_tags).values(values);
    return true;
  } catch (error) {
    console.error('为文章添加标签失败:', error);
    return false;
  }
}

export async function removeAllTagsFromPost(postId: number): Promise<boolean> {
  try {
    await db().delete(post_tags).where(eq(post_tags.post_id, postId));
    return true;
  } catch (error) {
    console.error('删除文章标签失败:', error);
    return false;
  }
}

export async function updatePostTags(postId: number, tagIds: number[]): Promise<boolean> {
  try {
    await removeAllTagsFromPost(postId);
    
    if (tagIds.length > 0) {
      return await addTagsToPost(postId, tagIds);
    }
    
    return true;
  } catch (error) {
    console.error('更新文章标签失败:', error);
    return false;
  }
}

export async function getTagIdsByPostId(postId: number): Promise<number[]> {
  try {
    const result = await db().select({ tag_id: post_tags.tag_id })
      .from(post_tags)
      .where(eq(post_tags.post_id, postId));

    return result.map(row => row.tag_id);
  } catch (error) {
    console.error('获取文章标签ID失败:', error);
    return [];
  }
}

export async function getPostIdsByTagId(tagId: number): Promise<number[]> {
  try {
    const result = await db().select({ post_id: post_tags.post_id })
      .from(post_tags)
      .where(eq(post_tags.tag_id, tagId));

    return result.map(row => row.post_id);
  } catch (error) {
    console.error('获取标签文章ID失败:', error);
    return [];
  }
}

export async function hasTag(postId: number, tagId: number): Promise<boolean> {
  try {
    const result = await db().select()
      .from(post_tags)
      .where(and(
        eq(post_tags.post_id, postId),
        eq(post_tags.tag_id, tagId)
      ))
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error('检查文章标签失败:', error);
    return false;
  }
}

export async function removeTagFromPost(postId: number, tagId: number): Promise<boolean> {
  try {
    await db().delete(post_tags).where(and(
      eq(post_tags.post_id, postId),
      eq(post_tags.tag_id, tagId)
    ));
    return true;
  } catch (error) {
    console.error('删除文章标签关联失败:', error);
    return false;
  }
}