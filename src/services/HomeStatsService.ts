import { db } from '@/lib/db';
import { posts } from '@/lib/schema';
import { eq, count, sql } from 'drizzle-orm';
import { getKVCache, CacheKeys } from '@/lib/kvCache';

export interface HomeStats {
  totalPosts: number;
  totalViews: number;
}

export class HomeStatsService {
  static async getStats(): Promise<HomeStats> {
    const kv = await getKVCache();
    if (kv) {
      const cached = await kv.get<HomeStats>(CacheKeys.HOME_STATS);
      if (cached) return cached;
    }

    // 单条聚合查询：统计已发布文章数量与总浏览量
    const result = await db()
      .select({
        totalPosts: count().as('totalPosts'),
        totalViews: sql<number>`COALESCE(SUM(${posts.view_count}), 0)`.as('totalViews'),
      })
      .from(posts)
      .where(eq(posts.is_published, true));

    const row = result[0] || { totalPosts: 0, totalViews: 0 } as any;
    const stats: HomeStats = {
      totalPosts: Number(row.totalPosts) || 0,
      totalViews: Number(row.totalViews) || 0,
    };

    if (kv) {
      await kv.set(CacheKeys.HOME_STATS, stats);
    }

    return stats;
  }

  static async invalidate(): Promise<void> {
    const kv = await getKVCache();
    if (kv) {
      await kv.delete(CacheKeys.HOME_STATS);
    }
  }
}
