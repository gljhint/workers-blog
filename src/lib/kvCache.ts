/**
 * Cloudflare KV 缓存服务
 * 用于在 Workers 环境中提供高性能缓存
 */

export interface CacheOptions {
  ttl?: number; // 过期时间（秒）
  expirationTtl?: number; // 绝对过期时间戳
}

export class KVCache {
  private kv: KVNamespace;
  private defaultTTL: number = 300; // 默认5分钟

  constructor(kvNamespace: KVNamespace) {
    this.kv = kvNamespace;
  }

  /**
   * 获取缓存值
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.kv.get(key, 'json');
      return value as T;
    } catch (error) {
      console.error('KV Cache get error:', error);
      return null;
    }
  }

  /**
   * 设置缓存值
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const putOptions: any = {};
      
      if (options?.ttl) {
        putOptions.expirationTtl = options.ttl;
      } else if (options?.expirationTtl) {
        putOptions.expiration = options.expirationTtl;
      } else {
        putOptions.expirationTtl = this.defaultTTL;
      }

      await this.kv.put(key, JSON.stringify(value), putOptions);
    } catch (error) {
      console.error('KV Cache set error:', error);
    }
  }

  /**
   * 删除缓存值
   */
  async delete(key: string): Promise<void> {
    try {
      await this.kv.delete(key);
    } catch (error) {
      console.error('KV Cache delete error:', error);
    }
  }

  /**
   * 批量删除缓存
   */
  async deleteMany(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map(key => this.kv.delete(key)));
    } catch (error) {
      console.error('KV Cache deleteMany error:', error);
    }
  }

  /**
   * 清除所有匹配前缀的缓存
   */
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

  /**
   * 获取或设置缓存（如果不存在则执行函数并缓存结果）
   */
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

  /**
   * 检查缓存是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      const value = await this.kv.get(key);
      return value !== null;
    } catch (error) {
      console.error('KV Cache exists error:', error);
      return false;
    }
  }

  /**
   * 获取缓存的元数据（包括过期时间等）
   */
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
 */
export function getKVCache(): KVCache | null {
  // 在 Workers 环境中获取 KV 实例
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    // 开发环境返回 null，使用内存缓存
    return null;
  }

  // 在 Workers 环境中，通过 globalThis 获取绑定的 KV
  const kv = (globalThis as any).CACHE as KVNamespace;
  if (kv) {
    return new KVCache(kv);
  }

  return null;
}

/**
 * 缓存键生成器
 */
export const CacheKeys = {
  SITE_SETTINGS: 'site:settings',
  POST: (id: number) => `post:${id}`,
  POSTS_LIST: (page: number, category?: string, tag?: string) => 
    `posts:list:${page}:${category || 'all'}:${tag || 'all'}`,
  CATEGORIES: 'categories:all',
  TAGS: 'tags:all',
  MENUS: 'menus:all',
  COMMENTS: (postId: number) => `comments:post:${postId}`,
  PAGES_LIST: 'pages:list',
  PAGE: (slug: string) => `page:${slug}`,
} as const;