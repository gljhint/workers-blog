/**
 * Cloudflare KV 缓存服务
 * 用于 Workers 环境中提供高性能缓存
 */
import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface CacheOptions {
  // 相对过期时间（秒）
  ttl?: number;
  // 绝对过期时间（Unix 时间戳，秒）
  expiration?: number;
}

export class KVCache {
  private kv: KVNamespace;
  // 不强制默认 TTL；若未提供 TTL/绝对过期时间，则存储为长期缓存
  private defaultTTL: number | null = null;

  constructor(kvNamespace: KVNamespace) {
    this.kv = kvNamespace;
  }

  /** 获取缓存值 */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.kv.get(key, 'json');
      return value as T;
    } catch (error) {
      console.error('KV Cache get error:', error);
      return null;
    }
  }

  /** 设置缓存值 */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const putOptions: Record<string, any> = {};
      // 仅当明确提供过期配置时，才设置过期；否则作为长期缓存
      if (typeof options?.ttl === 'number') {
        putOptions.expirationTtl = options.ttl;
      } else if (this.defaultTTL != null) {
        putOptions.expirationTtl = this.defaultTTL;
      }
      if (typeof options?.expiration === 'number') {
        putOptions.expiration = options.expiration;
      }

      await this.kv.put(key, JSON.stringify(value), putOptions);
    } catch (error) {
      console.error('KV Cache set error:', error);
    }
  }

  /** 删除缓存 */
  async delete(key: string): Promise<void> {
    try {
      await this.kv.delete(key);
    } catch (error) {
      console.error('KV Cache delete error:', error);
    }
  }

  /** 批量删除缓存 */
  async deleteMany(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map(key => this.kv.delete(key)));
    } catch (error) {
      console.error('KV Cache deleteMany error:', error);
    }
  }

  /** 清除所有匹配前缀的缓存 */
  async clearByPrefix(prefix: string): Promise<void> {
    try {
      const { keys } = await this.kv.list({ prefix });
      const keysToDelete = keys.map(key => key.name);
      if (keysToDelete.length > 0) {
        await this.deleteMany(keysToDelete);
      }
    } catch (error) {
      console.error('KV Cache clearByPrefix error:', error);
    }
  }

  /** 获取或设置缓存（如果不存在则执行函数并缓存结果） */
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    // 尝试从缓存获取
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // 缓存不存在，执行函数获取数据
    const result = await fetchFunction();

    // 将结果存入缓存
    await this.set(key, result, options);

    return result;
  }

  /** 检查缓存是否存在 */
  async exists(key: string): Promise<boolean> {
    try {
      const value = await this.kv.get(key);
      return value !== null;
    } catch (error) {
      console.error('KV Cache exists error:', error);
      return false;
    }
  }

  /** 获取缓存的元数据（包括过期时间等） */
  async getWithMetadata<T>(key: string): Promise<{ value: T | null; metadata: any }> {
    try {
      const result = await this.kv.getWithMetadata(key, 'json');
      return {
        value: result.value as T,
        metadata: result.metadata
      };
    } catch (error) {
      console.error('KV Cache getWithMetadata error:', error);
      return { value: null, metadata: null };
    }
  }
}

/**
 * 获取 KV 缓存实例
 * 兼容多种绑定名，并优先从 Cloudflare 环境 `env` 读取
 */
export function getKVCache(): KVCache | null {
  try {
    const { env } = getCloudflareContext();
    const candidates = [
      'CACHE',
      'KV',
      'CACHE_KV',
      // 现有 wrangler 配置中的命名
      'shidaiweisheng',
    ];
    for (const name of candidates) {
      const ns = (env as any)[name] as KVNamespace | undefined;
      if (ns) {
        return new KVCache(ns);
      }
    }
  } catch (_) {
    // 忽略上下文获取失败，继续尝试 globalThis
  }

  const globalCandidates = [
    'CACHE',
    'KV',
    'CACHE_KV',
    'shidaiweisheng',
  ];
  for (const name of globalCandidates) {
    const ns = (globalThis as any)[name] as KVNamespace | undefined;
    if (ns) {
      return new KVCache(ns);
    }
  }

  return null;
}

/** 缓存键生成器 */
export const CacheKeys = {
  SITE_SETTINGS: 'site:settings',
  POST: (id: number) => `post:${id}`,
  POST_BY_SLUG: (slug: string) => `post:slug:${slug}`,
  POSTS_LIST: (page: number, category?: string, tag?: string) =>
    `posts:list:${page}:${category || 'all'}:${tag || 'all'}`,
  POSTS_ALL: 'posts:all',
  CATEGORIES: 'categories:all',
  TAGS: 'tags:all',
  MENUS: 'menus:all',
  HOME_STATS: 'home:stats',
  COMMENTS: (postId: number) => `comments:post:${postId}`,
  PAGES_LIST: 'pages:list',
  PAGE: (slug: string) => `page:${slug}`,
} as const;
