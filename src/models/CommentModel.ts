import { db } from "@/lib/db";
import { comments } from "@/lib/schema";
import { eq, and, desc, count, like, or, inArray } from "drizzle-orm";
import type { InferSelectModel } from 'drizzle-orm';

export type Comment = InferSelectModel<typeof comments>;

export interface CreateCommentData {
  post_id: number;
  author_name: string;
  author_email: string;
  author_website?: string;
  author_ip?: string;
  user_agent?: string;
  content: string;
  is_approved?: boolean;
  parent_id?: number;
}

export interface CreateReplyData {
  parent_id: number;
  post_id: number;
  author_name: string;
  author_email: string;
  author_website?: string;
  content: string;
  is_approved?: boolean;
}

export async function getApprovedCommentsByPostId(postId: number): Promise<Comment[]> {
  try {
    const result = await db().select()
      .from(comments)
      .where(and(eq(comments.post_id, postId), eq(comments.is_approved, true)))
      .orderBy(desc(comments.created_at));

    return result;
  } catch (error) {
    console.error('获取评论失败:', error);
    return [];
  }
}

export async function createComment(data: CreateCommentData): Promise<Comment | null> {
  try {
    const now = new Date().toISOString();
    const result = await db().insert(comments).values({
      ...data,
      is_approved: data.is_approved ?? false,
      reply_count: 0,
      created_at: now,
      updated_at: now
    }).returning();

    return (result as Comment[])[0] || null;
  } catch (error) {
    console.error('创建评论失败:', error);
    return null;
  }
}

export async function approveComment(id: number): Promise<boolean> {
  try {
    await db().update(comments)
      .set({ 
        is_approved: true,
        updated_at: new Date().toISOString()
      })
      .where(eq(comments.id, id));

    return true;
  } catch (error) {
    console.error('批准评论失败:', error);
    return false;
  }
}

export async function deleteComment(id: number): Promise<boolean> {
  try {
    await db().delete(comments)
      .where(eq(comments.id, id));

    return true;
  } catch (error) {
    console.error('删除评论失败:', error);
    return false;
  }
}

export async function getCommentStats(): Promise<{
  total: number;
  approved: number;
  pending: number;
}> {
  try {
    const [totalResult, approvedResult, pendingResult] = await Promise.all([
      db().select({ count: count() }).from(comments),
      db().select({ count: count() }).from(comments).where(eq(comments.is_approved, true)),
      db().select({ count: count() }).from(comments).where(eq(comments.is_approved, false))
    ]);

    return {
      total: totalResult[0]?.count || 0,
      approved: approvedResult[0]?.count || 0,
      pending: pendingResult[0]?.count || 0
    };
  } catch (error) {
    console.error('获取评论统计失败:', error);
    return { total: 0, approved: 0, pending: 0 };
  }
}

export async function getRecentComments(limit: number = 10): Promise<Comment[]> {
  try {
    const result = await db().select()
      .from(comments)
      .orderBy(desc(comments.created_at))
      .limit(limit);

    return result;
  } catch (error) {
    console.error('获取最近评论失败:', error);
    return [];
  }
}

export async function getAllComments(
  page: number = 1, 
  limit: number = 20, 
  status?: string
): Promise<{ comments: Comment[]; total: number }> {
  try {
    const offset = (page - 1) * limit;
    
    let whereClause;
    if (status === 'approved') {
      whereClause = eq(comments.is_approved, true);
    } else if (status === 'pending') {
      whereClause = eq(comments.is_approved, false);
    }

    const [commentsResult, totalResult] = await Promise.all([
      db().select()
        .from(comments)
        .where(whereClause)
        .orderBy(desc(comments.created_at))
        .limit(limit)
        .offset(offset),
      db().select({ count: count() })
        .from(comments)
        .where(whereClause)
    ]);

    return {
      comments: commentsResult,
      total: totalResult[0]?.count || 0
    };
  } catch (error) {
    console.error('获取所有评论失败:', error);
    return { comments: [], total: 0 };
  }
}

export async function searchComments(
  keyword: string,
  page: number = 1,
  limit: number = 20
): Promise<{ comments: Comment[]; total: number }> {
  try {
    const offset = (page - 1) * limit;
    const searchPattern = `%${keyword}%`;

    const whereClause = or(
      like(comments.content, searchPattern),
      like(comments.author_name, searchPattern),
      like(comments.author_email, searchPattern)
    );

    const [commentsResult, totalResult] = await Promise.all([
      db().select()
        .from(comments)
        .where(whereClause)
        .orderBy(desc(comments.created_at))
        .limit(limit)
        .offset(offset),
      db().select({ count: count() })
        .from(comments)
        .where(whereClause)
    ]);

    return {
      comments: commentsResult,
      total: totalResult[0]?.count || 0
    };
  } catch (error) {
    console.error('搜索评论失败:', error);
    return { comments: [], total: 0 };
  }
}

export async function updateCommentsStatus(ids: number[], isApproved: boolean): Promise<boolean> {
  try {
    await db().update(comments)
      .set({ 
        is_approved: isApproved,
        updated_at: new Date().toISOString()
      })
      .where(inArray(comments.id, ids));

    return true;
  } catch (error) {
    console.error('批量更新评论状态失败:', error);
    return false;
  }
}

export async function deleteComments(ids: number[]): Promise<boolean> {
  try {
    await db().delete(comments)
      .where(inArray(comments.id, ids));

    return true;
  } catch (error) {
    console.error('批量删除评论失败:', error);
    return false;
  }
}

// ========== 回复相关功能 ==========

export async function getRepliesByCommentId(commentId: number): Promise<Comment[]> {
  try {
    const result = await db().select()
      .from(comments)
      .where(eq(comments.parent_id, commentId))
      .orderBy(comments.created_at);

    return result;
  } catch (error) {
    console.error('获取评论回复失败:', error);
    return [];
  }
}

export async function createCommentReply(data: CreateCommentData & { parent_id: number }): Promise<Comment | null> {
  try {
    const now = new Date().toISOString();
    const result = await db().insert(comments).values({
      ...data,
      parent_id: data.parent_id,
      is_approved: data.is_approved ?? false,
      reply_count: 0,
      created_at: now,
      updated_at: now
    }).returning();

    // 更新父评论的回复数量
    if ((result as Comment[])[0]) {
      await updateCommentReplyCount(data.parent_id);
    }

    return (result as Comment[])[0] || null;
  } catch (error) {
    console.error('创建评论回复失败:', error);
    return null;
  }
}

export async function updateCommentReplyCount(commentId: number): Promise<boolean> {
  try {
    const countResult = await db().select({ count: count() })
      .from(comments)
      .where(eq(comments.parent_id, commentId));

    const replyCount = countResult[0]?.count || 0;

    await db().update(comments)
      .set({
        reply_count: replyCount,
        updated_at: new Date().toISOString()
      })
      .where(eq(comments.id, commentId));

    return true;
  } catch (error) {
    console.error('更新评论回复数量失败:', error);
    return false;
  }
}

export async function getCommentsWithReplies(postId: number): Promise<Comment[]> {
  try {
    // 获取所有该文章的评论（包括回复）
    const result = await db().select()
      .from(comments)
      .where(and(eq(comments.post_id, postId), eq(comments.is_approved, true)))
      .orderBy(comments.created_at);

    return result;
  } catch (error) {
    console.error('获取评论列表失败:', error);
    return [];
  }
}

export async function findCommentById(commentId: number): Promise<Comment | null> {
  try {
    const result = await db().select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('查找评论失败:', error);
    return null;
  }
}

export function buildCommentTree(comments: Comment[]): Comment[] {
  const commentMap = new Map<number, Comment & { replies?: Comment[] }>();
  const rootComments: Comment[] = [];

  // 首先创建所有评论的映射
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // 然后构建树形结构
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!;
    
    if (comment.parent_id) {
      // 这是一个回复
      const parent = commentMap.get(comment.parent_id);
      if (parent && parent.replies) {
        parent.replies.push(commentWithReplies);
      }
    } else {
      // 这是一个顶级评论
      rootComments.push(commentWithReplies);
    }
  });

  return rootComments;
}


export interface UpdateCommentData {
  author_name?: string;
  author_email?: string;
  author_website?: string;
  content?: string;
  is_approved?: boolean;
}

export async function updateComment(id: number, data: UpdateCommentData): Promise<Comment | null> {
  try {
    const cleanData: Record<string, any> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanData[key] = value;
      }
    });

    if (Object.keys(cleanData).length === 0) {
      return findCommentById(id);
    }

    cleanData.updated_at = new Date().toISOString();

    const result = await db().update(comments)
      .set(cleanData)
      .where(eq(comments.id, id))
      .returning();

    return (result as Comment[])[0] || null;
  } catch (error) {
    console.error('更新评论失败:', error);
    return null;
  }
}